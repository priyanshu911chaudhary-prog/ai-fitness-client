import { PublicClientApplication } from "@azure/msal-browser";

const msalConfig = {
  auth: {
    clientId: "537f1e34-78ee-4f6e-816e-a8cea6552c56",
    authority: "https://login.microsoftonline.com/common",
    redirectUri: window.location.origin + "/auth-redirect.html",
  },
};

const msalInstance = new PublicClientApplication(msalConfig);

export default msalInstance;
