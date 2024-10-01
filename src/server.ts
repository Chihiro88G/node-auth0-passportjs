import cors from 'cors';
import express, { Express, Request, Response } from 'express';
import path from 'path';
import passport from 'passport';
import { Strategy as Auth0Strategy } from 'passport-auth0';
import 'dotenv/config';
import { auth, requiresAuth } from 'express-openid-connect';
const expressSession = require('express-session');

const port = process.env.PORT;

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_CLIENT_SECRET,
  baseURL: process.env.AUTH0_DOMAIN,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
};

const app: Express = express();

interface CookieConfig {
  secure?: boolean;
  httpOnly?: boolean;
  domain?: string;
  path?: string;
  maxAge?: number;
  sameSite?: boolean | 'lax' | 'strict' | 'none';
}

const cookieConfig: CookieConfig = {
  // Set default values for cookie
  // httpOnly: true,
  // path: '/',
};

const session = {
  secret: process.env.SESSION_SECRET,
  cookie: cookieConfig,
  resave: false,
  saveUninitialized: false
};

if (app.get("env") === "production") {
  // Serve secure cookies, requires HTTPS
  session.cookie.secure = true;
}

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'something');
app.use(express.static(path.join(__dirname, 'public')));

app.use(expressSession(session));

const strategy = new (Auth0Strategy as any)(
  {
    domain: process.env.AUTH0_DOMAIN,
    clientID: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    callbackURL: process.env.AUTO0_CALLBACK_URL,
  },
  (accessToken: any, refreshToken: any, extraParams: any, profile: any, done: any) => {
    

    return done(null, profile);
  }
)

passport.use(strategy);
app.use(passport.initialize());
app.use(passport.session());

app.use(auth(config));
app.use(cors());

app.get('/', (req: Request, res: Response) => {
  console.log('isAuthenticated: ' + req.oidc.isAuthenticated());
  res.send('Server is running!');
});

app.get('/profile', requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user));
});

app.listen(port, () => {
 console.log(`App listening on port ${port}`);
});