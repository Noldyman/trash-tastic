import { AddressInfo, PickupDate, WasteStream } from "./models";

const env = {
  postalCode: process.env.POSTAL_CODE,
  streetNumber: process.env.STREET_NUMBER,
  serverBaseUrl: process.env.SERVER_BASE_URL,
  hassPort: process.env.HASS_PORT,
  webhookId: process.env.WEBHOOK_ID,
};

export const getAddressInfo = async (): Promise<AddressInfo> => {
  const response = await fetch(
    `https://afvalkalender.dar.nl/adressen/${env.postalCode}:${env.streetNumber}`
  );
  return (await response.json())[0];
};

export const getWasteStreams = async (
  bagId: string
): Promise<WasteStream[]> => {
  const response = await fetch(
    `https://afvalkalender.dar.nl/rest/adressen/${bagId}/afvalstromen`
  );
  return await response.json();
};

export const getPickupDates = async (bagId: string): Promise<PickupDate[]> => {
  const response = await fetch(
    `https://afvalkalender.dar.nl/rest/adressen/${bagId}/kalender/${new Date().getFullYear()}`
  );
  return await response.json();
};

type WebhookPayload = {
  enableButtons: {
    rest: boolean;
    pmd: boolean;
    gft: boolean;
    paper: boolean;
  };
  wasteStreams: string[];
};

export const triggerWebhook = async (payload: WebhookPayload) => {
  await fetch(
    `${env.serverBaseUrl}:${env.hassPort}/api/webhook/${env.webhookId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );
};
