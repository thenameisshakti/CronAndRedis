import fs from "fs";
import path from "path";

const logDir = path.join(process.cwd(), "logs");
const logFile = path.join(logDir, "activity.log");

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const activityQueue = [];

export const pushInActivityQueue = ({
  action,
  teamId,
  taskId,
  performedBy,
  meta = {},
}) => {

  activityQueue.push({
    action,
    teamId,
    taskId,
    performedBy,
    meta,
    timeStamp: new Date().toISOString(),
  });
};

export const emptyActivityQueue = () => {
  if (activityQueue.length === 0) return;

  const activities = [...activityQueue];
  activityQueue.length = 0;

  for (const activity of activities) {
    const logLine = `[${activity.timeStamp}] ${activity.action} | team: ${
      activity.teamId
    } | task : ${activity.taskId} | By: ${
      activity.performedBy
    } | meta = ${JSON.stringify(activity.meta)} \n`;

    fs.appendFileSync(logFile, logLine);
  }
};
