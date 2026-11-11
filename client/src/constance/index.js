export const CHECKBOX = "checkbox",
             TEXT     = "text",
             FILE     = "file",
             SELECT   = "select",
             PASSWORD = "password";

/** Same limit as the server, so a too-big file is caught before it is sent. */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/** Same limits as the server's sign-up checks. */
export const USERNAME_PATTERN = /^[A-Za-z0-9_.-]{3,32}$/;
export const MIN_PASSWORD_LENGTH = 8;

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/** [midnight seven days ago, midnight today] for the given date. */
export const beginDate = (currentDate) => {
  const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  return [new Date(today.getTime() - SEVEN_DAYS_MS), today];
};
