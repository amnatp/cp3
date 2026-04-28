import { PublicClientApplication, LogLevel } from "@azure/msal-browser";

export const TENANT_ID  = "46667de6-a06c-4599-98db-6910c8b2b935";
export const CLIENT_ID  = "ba9fd5fc-c3cf-4c99-a698-fce6fcf3dd54"; // customer-portal-spa
export const API_SCOPE  = "api://8ce4b23f-ad26-4918-81c6-0d58dabb7546/access_as_user"; // customer-portal API

const msalConfig = {
  auth: {
    clientId:    CLIENT_ID,
    authority:   `https://login.microsoftonline.com/${TENANT_ID}`,
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation:    "sessionStorage",
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        if (level === LogLevel.Error) console.error(message);
      },
      logLevel: LogLevel.Error,
    },
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);

/** Token request used for silent/interactive token acquisition. */
export const tokenRequest = { scopes: [API_SCOPE] };
