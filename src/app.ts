require("dotenv").config();
import schedule from "node-schedule";
import {
  getAddressInfo,
  getWasteStreams,
  getPickupDates,
  triggerWebhook,
} from "./services";
import { add, format } from "date-fns";

export type HassButtonName = "gft" | "pmd" | "paper" | "rest";
const idMap: { [k: number]: HassButtonName } = {
  1: "gft",
  3: "pmd",
  4: "paper",
  5: "rest",
};

const sendTrashReminder = async () => {
  try {
    const addressInfo = await getAddressInfo();
    const [wasteStreams, pickupDates] = await Promise.all([
      getWasteStreams(addressInfo.bagid),
      getPickupDates(addressInfo.bagid),
    ]);

    const tomorrowsDate = format(add(new Date(), { days: 1 }), "yyyy-MM-dd");

    const enableButtons: { [k in HassButtonName]: boolean } = {
      rest: false,
      pmd: false,
      gft: false,
      paper: false,
    };
    const pickupsTomorrow = pickupDates
      .filter(({ ophaaldatum }) => ophaaldatum === tomorrowsDate)
      .reduce((acc, { afvalstroom_id }) => {
        const wasteStream = wasteStreams.find(
          ({ id }) => id === afvalstroom_id
        );
        if (wasteStream) {
          acc.push(wasteStream.title);
          if (idMap[wasteStream.id]) {
            enableButtons[idMap[wasteStream.id]] = true;
          }
        }
        return acc;
      }, [] as string[]);

    if (pickupsTomorrow.length) {
      await triggerWebhook({
        enableButtons,
        wasteStreams: pickupsTomorrow,
      });
    }
  } catch (err) {
    console.log("Something went wrong:", JSON.stringify(err));
  }
};

const startApp = () => {
  const rule = new schedule.RecurrenceRule();
  rule.hour = 17;
  rule.minute = 30;
  rule.tz = "Europe/Amsterdam";

  schedule.scheduleJob(rule, sendTrashReminder);
  console.log("Trash-tastic has been started...");
};

startApp();
