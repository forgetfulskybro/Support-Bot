module.exports = class ChalkAdvanced {
  static black(text) {
    return `\x1b[30m${text}\x1b[0m`;
  }

  static red(text) {
    return `\x1b[31m${text}\x1b[0m`;
  }

  static green(text) {
    return `\x1b[32m${text}\x1b[0m`;
  }

  static yellow(text) {
    return `\x1b[33m${text}\x1b[0m`;
  }

  static blue(text) {
    return `\x1b[34m${text}\x1b[0m`;
  }

  static magenta(text) {
    return `\x1b[35m${text}\x1b[0m`;
  }

  static cyan(text) {
    return `\x1b[36m${text}\x1b[0m`;
  }

  static white(text) {
    return `\x1b[37m${text}\x1b[0m`;
  }

  static gray(text) {
    return `\x1b[90m${text}\x1b[0m`;
  }

  static bgBlack(text) {
    return `\x1b[40m${text}\x1b[0m`;
  }

  static bgRed(text) {
    return `\x1b[41m${text}\x1b[0m`;
  }

  static bgGreen(text) {
    return `\x1b[42m${text}\x1b[0m`;
  }

  static bgYellow(text) {
    return `\x1b[43m${text}\x1b[0m`;
  }

  static bgBlue(text) {
    return `\x1b[44m${text}\x1b[0m`;
  }

  static bgMagenta(text) {
    return `\x1b[45m${text}\x1b[0m`;
  }

  static bgCyan(text) {
    return `\x1b[46m${text}\x1b[0m`;
  }

  static bgWhite(text) {
    return `\x1b[47m${text}\x1b[0m`;
  }

  static bold(text) {
    return `\x1b[1m${text}\x1b[0m`;
  }

  static dim(text) {
    return `\x1b[2m${text}\x1b[0m`;
  }

  static italic(text) {
    return `\x1b[3m${text}\x1b[0m`;
  }

  static underline(text) {
    return `\x1b[4m${text}\x1b[0m`;
  }

  static inverse(text) {
    return `\x1b[7m${text}\x1b[0m`;
  }

  static hide(text) {
    return `\x1b[8m${text}\x1b[0m`;
  }

  static strikethrough(text) {
    return `\x1b[9m${text}\x1b[0m`;
  }
};
