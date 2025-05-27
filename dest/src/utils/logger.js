import chalk from "chalk";
import { createLogger, format, transports } from "winston";
class CustomLogger {
    logger;
    static instance;
    constructor() {
        const { combine, printf, timestamp, errors, uncolorize } = format;
        const levelFormats = {
            alert: chalk.red("[ALERT]"),
            error: chalk.redBright("[ERROR]"),
            runtime: chalk.blue("[RUNTIME]"),
            warn: chalk.yellowBright("[WARNING]"),
            info: chalk.cyanBright("[INFO]"),
            sent: chalk.greenBright("[SENT]"),
            debug: chalk.blackBright("[DEBUG]"),
        };
        const consoleFormat = printf((info) => {
            const formattedTimestamp = chalk.bgYellow.black(String(info.timestamp));
            const levelLabel = levelFormats[info.level] || chalk.magenta(`[${info.level.toUpperCase()}]`);
            return info.stack
                ? `${formattedTimestamp} ${levelLabel} ${String(info.message)}\n${chalk.redBright(info.stack)}`
                : `${formattedTimestamp} ${levelLabel} ${info.level == "debug" ? chalk.blackBright(String(info.message)) : String(info.message)}`;
        });
        const fileFormat = printf((info) => {
            return info.stack
                ? `[${info.timestamp}] [${info.level.toUpperCase()}] ${String(info.message)}\n  Stack trace:\n    ${info.stack}`
                : `[${info.timestamp}] [${info.level.toUpperCase()}] ${String(info.message)}`;
        });
        this.logger = createLogger({
            level: "sent",
            levels: {
                alert: 0,
                error: 1,
                runtime: 2,
                warn: 3,
                info: 4,
                data: 5,
                sent: 6,
                debug: 7
            },
            format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), errors({ stack: true })),
            transports: [
                new transports.Console({
                    format: consoleFormat,
                }),
                new transports.File({
                    level: "debug",
                    filename: "logs/console.log",
                    maxsize: 1024 * 1024 * 10,
                    maxFiles: 5,
                    zippedArchive: true,
                    format: combine(uncolorize(), fileFormat)
                })
            ],
            exitOnError: false,
            handleRejections: true,
            handleExceptions: true
        });
    }
    static getInstance() {
        if (!CustomLogger.instance) {
            CustomLogger.instance = new CustomLogger();
        }
        return CustomLogger.instance;
    }
    log(level, message) {
        if (message instanceof Error) {
            this.logger.log(level, message.message, { stack: message.stack });
        }
        else {
            this.logger.log(level, message);
        }
    }
    alert(message) {
        this.log("alert", message);
    }
    error(message) {
        this.log("error", message);
    }
    warn(message) {
        this.log("warn", message);
    }
    info(message) {
        this.log("info", message);
    }
    sent(message) {
        this.log("sent", message);
    }
    debug(message) {
        this.log("debug", message);
    }
}
export const logger = CustomLogger.getInstance();
