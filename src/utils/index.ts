import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";

dayjs.extend(relativeTime);
dayjs.extend(updateLocale);

dayjs.updateLocale("en", {
  relativeTime: {
    future: "%s",
    past: "%s",
    s: "Just now",
    m: "1m",
    mm: "%dm",
    h: "1h",
    hh: "%dh",
    d: "1d",
    dd: "%dd",
    M: "1month",
    MM: "%dmonths",
    y: "1y",
    yy: "%dy",
  },
});

export const imageProxy = (url: string) =>
  `https://images.weserv.nl/?url=${encodeURIComponent(
    url
  )}&w=32&h=32&output=webp`;

export const formatDate = (timestamp: number) => dayjs(timestamp).fromNow();

export const joinQueryString = (query: { [key: string]: any }) =>
  Object.keys(query)
    .map((key) => `${key}=${query[key]}`)
    .join("&");
