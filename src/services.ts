import { AddressInfo, PickupDate, WasteStream } from "./models";

const env = {
  postalCode: process.env.POSTAL_CODE,
  streetNumber: process.env.STREET_NUMBER,
  serverBaseUrl: process.env.SERVER_BASE_URL,
  hassPort: process.env.HASS_PORT,
  hassAccessToken: process.env.HASS_ACCESS_TOKEN,
};

export const getAddressInfo = async (): Promise<AddressInfo> => {
  const response = await fetch(
    `https://afvalkalender.dar.nl/adressen/${env.postalCode}:${env.streetNumber}`
  );
  return (await response.json())[0];
};

export const getWasteStreams = async (bagId: string): Promise<WasteStream[]> => {
  const response = await fetch(`https://afvalkalender.dar.nl/rest/adressen/${bagId}/afvalstromen`);
  return await response.json();
};

export const getPickupDates = async (bagId: string): Promise<PickupDate[]> => {
  const response = await fetch(
    `https://afvalkalender.dar.nl/rest/adressen/${bagId}/kalender/${new Date().getFullYear()}`
  );
  return await response.json();
};

export const sendPushNotification = async (pickupsTomorrow: string[]) => {
  const payload = {
    title: "Trash-tastic",
    message: `The following waste streams will be picked up tomorrow: ${pickupsTomorrow.join(
      ", "
    )}.`,
  };

  await fetch(`${env.serverBaseUrl}:${env.hassPort}/api/services/notify/mobile_app_iphone_6`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.hassAccessToken}`,
    },
    body: JSON.stringify(payload),
  });
};
