require("dotenv").config();
import schedule from "node-schedule";
import { getAddressInfo, getWasteStreams, getPickupDates, sendPushNotification } from "./services";
import { add, format } from "date-fns";

const sendTrashReminder = async () => {
  try {
    const addressInfo = await getAddressInfo();
    const [wasteStreams, pickupDates] = await Promise.all([
      getWasteStreams(addressInfo.bagid),
      getPickupDates(addressInfo.bagid),
    ]);

    const tomorrowsDate = format(add(new Date(), { days: 1 }), "yyyy-MM-dd");

    const pickupsTomorrow = pickupDates
      .filter(({ ophaaldatum }) => ophaaldatum === tomorrowsDate)
      .reduce((acc, { afvalstroom_id }) => {
        const wasteStream = wasteStreams.find(({ id }) => id === afvalstroom_id);
        if (wasteStream) {
          acc.push(wasteStream.title);
        }
        return acc;
      }, [] as string[]);

    if (pickupsTomorrow.length) {
      await sendPushNotification(pickupsTomorrow);
    }
  } catch (err) {
    console.log("Something went wrong:", JSON.stringify(err));
  }
};

const startApp = () => {
  const rule = new schedule.RecurrenceRule();
  rule.hour = 20;
  rule.tz = "Europe/Amsterdam";

  schedule.scheduleJob(rule, sendTrashReminder);
  console.log("Trash-tastic has been started...");
};

startApp();
