"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/.pnpm/postgres-array@2.0.0/node_modules/postgres-array/index.js
var require_postgres_array = __commonJS({
  "node_modules/.pnpm/postgres-array@2.0.0/node_modules/postgres-array/index.js"(exports2) {
    "use strict";
    exports2.parse = function(source, transform) {
      return new ArrayParser(source, transform).parse();
    };
    var ArrayParser = class _ArrayParser {
      constructor(source, transform) {
        this.source = source;
        this.transform = transform || identity;
        this.position = 0;
        this.entries = [];
        this.recorded = [];
        this.dimension = 0;
      }
      isEof() {
        return this.position >= this.source.length;
      }
      nextCharacter() {
        var character = this.source[this.position++];
        if (character === "\\") {
          return {
            value: this.source[this.position++],
            escaped: true
          };
        }
        return {
          value: character,
          escaped: false
        };
      }
      record(character) {
        this.recorded.push(character);
      }
      newEntry(includeEmpty) {
        var entry;
        if (this.recorded.length > 0 || includeEmpty) {
          entry = this.recorded.join("");
          if (entry === "NULL" && !includeEmpty) {
            entry = null;
          }
          if (entry !== null) entry = this.transform(entry);
          this.entries.push(entry);
          this.recorded = [];
        }
      }
      consumeDimensions() {
        if (this.source[0] === "[") {
          while (!this.isEof()) {
            var char = this.nextCharacter();
            if (char.value === "=") break;
          }
        }
      }
      parse(nested) {
        var character, parser, quote;
        this.consumeDimensions();
        while (!this.isEof()) {
          character = this.nextCharacter();
          if (character.value === "{" && !quote) {
            this.dimension++;
            if (this.dimension > 1) {
              parser = new _ArrayParser(this.source.substr(this.position - 1), this.transform);
              this.entries.push(parser.parse(true));
              this.position += parser.position - 2;
            }
          } else if (character.value === "}" && !quote) {
            this.dimension--;
            if (!this.dimension) {
              this.newEntry();
              if (nested) return this.entries;
            }
          } else if (character.value === '"' && !character.escaped) {
            if (quote) this.newEntry(true);
            quote = !quote;
          } else if (character.value === "," && !quote) {
            this.newEntry();
          } else {
            this.record(character.value);
          }
        }
        if (this.dimension !== 0) {
          throw new Error("array dimension not balanced");
        }
        return this.entries;
      }
    };
    function identity(value) {
      return value;
    }
  }
});

// node_modules/.pnpm/pg-types@2.2.0/node_modules/pg-types/lib/arrayParser.js
var require_arrayParser = __commonJS({
  "node_modules/.pnpm/pg-types@2.2.0/node_modules/pg-types/lib/arrayParser.js"(exports2, module2) {
    var array = require_postgres_array();
    module2.exports = {
      create: function(source, transform) {
        return {
          parse: function() {
            return array.parse(source, transform);
          }
        };
      }
    };
  }
});

// node_modules/.pnpm/postgres-date@1.0.7/node_modules/postgres-date/index.js
var require_postgres_date = __commonJS({
  "node_modules/.pnpm/postgres-date@1.0.7/node_modules/postgres-date/index.js"(exports2, module2) {
    "use strict";
    var DATE_TIME = /(\d{1,})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})(\.\d{1,})?.*?( BC)?$/;
    var DATE = /^(\d{1,})-(\d{2})-(\d{2})( BC)?$/;
    var TIME_ZONE = /([Z+-])(\d{2})?:?(\d{2})?:?(\d{2})?/;
    var INFINITY = /^-?infinity$/;
    module2.exports = function parseDate(isoDate) {
      if (INFINITY.test(isoDate)) {
        return Number(isoDate.replace("i", "I"));
      }
      var matches = DATE_TIME.exec(isoDate);
      if (!matches) {
        return getDate(isoDate) || null;
      }
      var isBC = !!matches[8];
      var year = parseInt(matches[1], 10);
      if (isBC) {
        year = bcYearToNegativeYear(year);
      }
      var month = parseInt(matches[2], 10) - 1;
      var day = matches[3];
      var hour = parseInt(matches[4], 10);
      var minute = parseInt(matches[5], 10);
      var second = parseInt(matches[6], 10);
      var ms = matches[7];
      ms = ms ? 1e3 * parseFloat(ms) : 0;
      var date;
      var offset = timeZoneOffset(isoDate);
      if (offset != null) {
        date = new Date(Date.UTC(year, month, day, hour, minute, second, ms));
        if (is0To99(year)) {
          date.setUTCFullYear(year);
        }
        if (offset !== 0) {
          date.setTime(date.getTime() - offset);
        }
      } else {
        date = new Date(year, month, day, hour, minute, second, ms);
        if (is0To99(year)) {
          date.setFullYear(year);
        }
      }
      return date;
    };
    function getDate(isoDate) {
      var matches = DATE.exec(isoDate);
      if (!matches) {
        return;
      }
      var year = parseInt(matches[1], 10);
      var isBC = !!matches[4];
      if (isBC) {
        year = bcYearToNegativeYear(year);
      }
      var month = parseInt(matches[2], 10) - 1;
      var day = matches[3];
      var date = new Date(year, month, day);
      if (is0To99(year)) {
        date.setFullYear(year);
      }
      return date;
    }
    function timeZoneOffset(isoDate) {
      if (isoDate.endsWith("+00")) {
        return 0;
      }
      var zone = TIME_ZONE.exec(isoDate.split(" ")[1]);
      if (!zone) return;
      var type = zone[1];
      if (type === "Z") {
        return 0;
      }
      var sign = type === "-" ? -1 : 1;
      var offset = parseInt(zone[2], 10) * 3600 + parseInt(zone[3] || 0, 10) * 60 + parseInt(zone[4] || 0, 10);
      return offset * sign * 1e3;
    }
    function bcYearToNegativeYear(year) {
      return -(year - 1);
    }
    function is0To99(num) {
      return num >= 0 && num < 100;
    }
  }
});

// node_modules/.pnpm/xtend@4.0.2/node_modules/xtend/mutable.js
var require_mutable = __commonJS({
  "node_modules/.pnpm/xtend@4.0.2/node_modules/xtend/mutable.js"(exports2, module2) {
    module2.exports = extend;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    function extend(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    }
  }
});

// node_modules/.pnpm/postgres-interval@1.2.0/node_modules/postgres-interval/index.js
var require_postgres_interval = __commonJS({
  "node_modules/.pnpm/postgres-interval@1.2.0/node_modules/postgres-interval/index.js"(exports2, module2) {
    "use strict";
    var extend = require_mutable();
    module2.exports = PostgresInterval;
    function PostgresInterval(raw) {
      if (!(this instanceof PostgresInterval)) {
        return new PostgresInterval(raw);
      }
      extend(this, parse(raw));
    }
    var properties = ["seconds", "minutes", "hours", "days", "months", "years"];
    PostgresInterval.prototype.toPostgres = function() {
      var filtered = properties.filter(this.hasOwnProperty, this);
      if (this.milliseconds && filtered.indexOf("seconds") < 0) {
        filtered.push("seconds");
      }
      if (filtered.length === 0) return "0";
      return filtered.map(function(property) {
        var value = this[property] || 0;
        if (property === "seconds" && this.milliseconds) {
          value = (value + this.milliseconds / 1e3).toFixed(6).replace(/\.?0+$/, "");
        }
        return value + " " + property;
      }, this).join(" ");
    };
    var propertiesISOEquivalent = {
      years: "Y",
      months: "M",
      days: "D",
      hours: "H",
      minutes: "M",
      seconds: "S"
    };
    var dateProperties = ["years", "months", "days"];
    var timeProperties = ["hours", "minutes", "seconds"];
    PostgresInterval.prototype.toISOString = PostgresInterval.prototype.toISO = function() {
      var datePart = dateProperties.map(buildProperty, this).join("");
      var timePart = timeProperties.map(buildProperty, this).join("");
      return "P" + datePart + "T" + timePart;
      function buildProperty(property) {
        var value = this[property] || 0;
        if (property === "seconds" && this.milliseconds) {
          value = (value + this.milliseconds / 1e3).toFixed(6).replace(/0+$/, "");
        }
        return value + propertiesISOEquivalent[property];
      }
    };
    var NUMBER = "([+-]?\\d+)";
    var YEAR = NUMBER + "\\s+years?";
    var MONTH = NUMBER + "\\s+mons?";
    var DAY = NUMBER + "\\s+days?";
    var TIME = "([+-])?([\\d]*):(\\d\\d):(\\d\\d)\\.?(\\d{1,6})?";
    var INTERVAL = new RegExp([YEAR, MONTH, DAY, TIME].map(function(regexString) {
      return "(" + regexString + ")?";
    }).join("\\s*"));
    var positions = {
      years: 2,
      months: 4,
      days: 6,
      hours: 9,
      minutes: 10,
      seconds: 11,
      milliseconds: 12
    };
    var negatives = ["hours", "minutes", "seconds", "milliseconds"];
    function parseMilliseconds(fraction) {
      var microseconds = fraction + "000000".slice(fraction.length);
      return parseInt(microseconds, 10) / 1e3;
    }
    function parse(interval) {
      if (!interval) return {};
      var matches = INTERVAL.exec(interval);
      var isNegative = matches[8] === "-";
      return Object.keys(positions).reduce(function(parsed, property) {
        var position = positions[property];
        var value = matches[position];
        if (!value) return parsed;
        value = property === "milliseconds" ? parseMilliseconds(value) : parseInt(value, 10);
        if (!value) return parsed;
        if (isNegative && ~negatives.indexOf(property)) {
          value *= -1;
        }
        parsed[property] = value;
        return parsed;
      }, {});
    }
  }
});

// node_modules/.pnpm/postgres-bytea@1.0.1/node_modules/postgres-bytea/index.js
var require_postgres_bytea = __commonJS({
  "node_modules/.pnpm/postgres-bytea@1.0.1/node_modules/postgres-bytea/index.js"(exports2, module2) {
    "use strict";
    var bufferFrom = Buffer.from || Buffer;
    module2.exports = function parseBytea(input) {
      if (/^\\x/.test(input)) {
        return bufferFrom(input.substr(2), "hex");
      }
      var output = "";
      var i = 0;
      while (i < input.length) {
        if (input[i] !== "\\") {
          output += input[i];
          ++i;
        } else {
          if (/[0-7]{3}/.test(input.substr(i + 1, 3))) {
            output += String.fromCharCode(parseInt(input.substr(i + 1, 3), 8));
            i += 4;
          } else {
            var backslashes = 1;
            while (i + backslashes < input.length && input[i + backslashes] === "\\") {
              backslashes++;
            }
            for (var k = 0; k < Math.floor(backslashes / 2); ++k) {
              output += "\\";
            }
            i += Math.floor(backslashes / 2) * 2;
          }
        }
      }
      return bufferFrom(output, "binary");
    };
  }
});

// node_modules/.pnpm/pg-types@2.2.0/node_modules/pg-types/lib/textParsers.js
var require_textParsers = __commonJS({
  "node_modules/.pnpm/pg-types@2.2.0/node_modules/pg-types/lib/textParsers.js"(exports2, module2) {
    var array = require_postgres_array();
    var arrayParser = require_arrayParser();
    var parseDate = require_postgres_date();
    var parseInterval = require_postgres_interval();
    var parseByteA = require_postgres_bytea();
    function allowNull(fn) {
      return function nullAllowed(value) {
        if (value === null) return value;
        return fn(value);
      };
    }
    function parseBool(value) {
      if (value === null) return value;
      return value === "TRUE" || value === "t" || value === "true" || value === "y" || value === "yes" || value === "on" || value === "1";
    }
    function parseBoolArray(value) {
      if (!value) return null;
      return array.parse(value, parseBool);
    }
    function parseBaseTenInt(string) {
      return parseInt(string, 10);
    }
    function parseIntegerArray(value) {
      if (!value) return null;
      return array.parse(value, allowNull(parseBaseTenInt));
    }
    function parseBigIntegerArray(value) {
      if (!value) return null;
      return array.parse(value, allowNull(function(entry) {
        return parseBigInteger(entry).trim();
      }));
    }
    var parsePointArray = function(value) {
      if (!value) {
        return null;
      }
      var p = arrayParser.create(value, function(entry) {
        if (entry !== null) {
          entry = parsePoint(entry);
        }
        return entry;
      });
      return p.parse();
    };
    var parseFloatArray = function(value) {
      if (!value) {
        return null;
      }
      var p = arrayParser.create(value, function(entry) {
        if (entry !== null) {
          entry = parseFloat(entry);
        }
        return entry;
      });
      return p.parse();
    };
    var parseStringArray = function(value) {
      if (!value) {
        return null;
      }
      var p = arrayParser.create(value);
      return p.parse();
    };
    var parseDateArray = function(value) {
      if (!value) {
        return null;
      }
      var p = arrayParser.create(value, function(entry) {
        if (entry !== null) {
          entry = parseDate(entry);
        }
        return entry;
      });
      return p.parse();
    };
    var parseIntervalArray = function(value) {
      if (!value) {
        return null;
      }
      var p = arrayParser.create(value, function(entry) {
        if (entry !== null) {
          entry = parseInterval(entry);
        }
        return entry;
      });
      return p.parse();
    };
    var parseByteAArray = function(value) {
      if (!value) {
        return null;
      }
      return array.parse(value, allowNull(parseByteA));
    };
    var parseInteger = function(value) {
      return parseInt(value, 10);
    };
    var parseBigInteger = function(value) {
      var valStr = String(value);
      if (/^\d+$/.test(valStr)) {
        return valStr;
      }
      return value;
    };
    var parseJsonArray = function(value) {
      if (!value) {
        return null;
      }
      return array.parse(value, allowNull(JSON.parse));
    };
    var parsePoint = function(value) {
      if (value[0] !== "(") {
        return null;
      }
      value = value.substring(1, value.length - 1).split(",");
      return {
        x: parseFloat(value[0]),
        y: parseFloat(value[1])
      };
    };
    var parseCircle = function(value) {
      if (value[0] !== "<" && value[1] !== "(") {
        return null;
      }
      var point = "(";
      var radius = "";
      var pointParsed = false;
      for (var i = 2; i < value.length - 1; i++) {
        if (!pointParsed) {
          point += value[i];
        }
        if (value[i] === ")") {
          pointParsed = true;
          continue;
        } else if (!pointParsed) {
          continue;
        }
        if (value[i] === ",") {
          continue;
        }
        radius += value[i];
      }
      var result = parsePoint(point);
      result.radius = parseFloat(radius);
      return result;
    };
    var init = function(register) {
      register(20, parseBigInteger);
      register(21, parseInteger);
      register(23, parseInteger);
      register(26, parseInteger);
      register(700, parseFloat);
      register(701, parseFloat);
      register(16, parseBool);
      register(1082, parseDate);
      register(1114, parseDate);
      register(1184, parseDate);
      register(600, parsePoint);
      register(651, parseStringArray);
      register(718, parseCircle);
      register(1e3, parseBoolArray);
      register(1001, parseByteAArray);
      register(1005, parseIntegerArray);
      register(1007, parseIntegerArray);
      register(1028, parseIntegerArray);
      register(1016, parseBigIntegerArray);
      register(1017, parsePointArray);
      register(1021, parseFloatArray);
      register(1022, parseFloatArray);
      register(1231, parseFloatArray);
      register(1014, parseStringArray);
      register(1015, parseStringArray);
      register(1008, parseStringArray);
      register(1009, parseStringArray);
      register(1040, parseStringArray);
      register(1041, parseStringArray);
      register(1115, parseDateArray);
      register(1182, parseDateArray);
      register(1185, parseDateArray);
      register(1186, parseInterval);
      register(1187, parseIntervalArray);
      register(17, parseByteA);
      register(114, JSON.parse.bind(JSON));
      register(3802, JSON.parse.bind(JSON));
      register(199, parseJsonArray);
      register(3807, parseJsonArray);
      register(3907, parseStringArray);
      register(2951, parseStringArray);
      register(791, parseStringArray);
      register(1183, parseStringArray);
      register(1270, parseStringArray);
    };
    module2.exports = {
      init
    };
  }
});

// node_modules/.pnpm/pg-int8@1.0.1/node_modules/pg-int8/index.js
var require_pg_int8 = __commonJS({
  "node_modules/.pnpm/pg-int8@1.0.1/node_modules/pg-int8/index.js"(exports2, module2) {
    "use strict";
    var BASE = 1e6;
    function readInt8(buffer) {
      var high = buffer.readInt32BE(0);
      var low = buffer.readUInt32BE(4);
      var sign = "";
      if (high < 0) {
        high = ~high + (low === 0);
        low = ~low + 1 >>> 0;
        sign = "-";
      }
      var result = "";
      var carry;
      var t;
      var digits;
      var pad;
      var l;
      var i;
      {
        carry = high % BASE;
        high = high / BASE >>> 0;
        t = 4294967296 * carry + low;
        low = t / BASE >>> 0;
        digits = "" + (t - BASE * low);
        if (low === 0 && high === 0) {
          return sign + digits + result;
        }
        pad = "";
        l = 6 - digits.length;
        for (i = 0; i < l; i++) {
          pad += "0";
        }
        result = pad + digits + result;
      }
      {
        carry = high % BASE;
        high = high / BASE >>> 0;
        t = 4294967296 * carry + low;
        low = t / BASE >>> 0;
        digits = "" + (t - BASE * low);
        if (low === 0 && high === 0) {
          return sign + digits + result;
        }
        pad = "";
        l = 6 - digits.length;
        for (i = 0; i < l; i++) {
          pad += "0";
        }
        result = pad + digits + result;
      }
      {
        carry = high % BASE;
        high = high / BASE >>> 0;
        t = 4294967296 * carry + low;
        low = t / BASE >>> 0;
        digits = "" + (t - BASE * low);
        if (low === 0 && high === 0) {
          return sign + digits + result;
        }
        pad = "";
        l = 6 - digits.length;
        for (i = 0; i < l; i++) {
          pad += "0";
        }
        result = pad + digits + result;
      }
      {
        carry = high % BASE;
        t = 4294967296 * carry + low;
        digits = "" + t % BASE;
        return sign + digits + result;
      }
    }
    module2.exports = readInt8;
  }
});

// node_modules/.pnpm/pg-types@2.2.0/node_modules/pg-types/lib/binaryParsers.js
var require_binaryParsers = __commonJS({
  "node_modules/.pnpm/pg-types@2.2.0/node_modules/pg-types/lib/binaryParsers.js"(exports2, module2) {
    var parseInt64 = require_pg_int8();
    var parseBits = function(data, bits, offset, invert, callback) {
      offset = offset || 0;
      invert = invert || false;
      callback = callback || function(lastValue, newValue, bits2) {
        return lastValue * Math.pow(2, bits2) + newValue;
      };
      var offsetBytes = offset >> 3;
      var inv = function(value) {
        if (invert) {
          return ~value & 255;
        }
        return value;
      };
      var mask = 255;
      var firstBits = 8 - offset % 8;
      if (bits < firstBits) {
        mask = 255 << 8 - bits & 255;
        firstBits = bits;
      }
      if (offset) {
        mask = mask >> offset % 8;
      }
      var result = 0;
      if (offset % 8 + bits >= 8) {
        result = callback(0, inv(data[offsetBytes]) & mask, firstBits);
      }
      var bytes = bits + offset >> 3;
      for (var i = offsetBytes + 1; i < bytes; i++) {
        result = callback(result, inv(data[i]), 8);
      }
      var lastBits = (bits + offset) % 8;
      if (lastBits > 0) {
        result = callback(result, inv(data[bytes]) >> 8 - lastBits, lastBits);
      }
      return result;
    };
    var parseFloatFromBits = function(data, precisionBits, exponentBits) {
      var bias = Math.pow(2, exponentBits - 1) - 1;
      var sign = parseBits(data, 1);
      var exponent = parseBits(data, exponentBits, 1);
      if (exponent === 0) {
        return 0;
      }
      var precisionBitsCounter = 1;
      var parsePrecisionBits = function(lastValue, newValue, bits) {
        if (lastValue === 0) {
          lastValue = 1;
        }
        for (var i = 1; i <= bits; i++) {
          precisionBitsCounter /= 2;
          if ((newValue & 1 << bits - i) > 0) {
            lastValue += precisionBitsCounter;
          }
        }
        return lastValue;
      };
      var mantissa = parseBits(data, precisionBits, exponentBits + 1, false, parsePrecisionBits);
      if (exponent == Math.pow(2, exponentBits + 1) - 1) {
        if (mantissa === 0) {
          return sign === 0 ? Infinity : -Infinity;
        }
        return NaN;
      }
      return (sign === 0 ? 1 : -1) * Math.pow(2, exponent - bias) * mantissa;
    };
    var parseInt16 = function(value) {
      if (parseBits(value, 1) == 1) {
        return -1 * (parseBits(value, 15, 1, true) + 1);
      }
      return parseBits(value, 15, 1);
    };
    var parseInt32 = function(value) {
      if (parseBits(value, 1) == 1) {
        return -1 * (parseBits(value, 31, 1, true) + 1);
      }
      return parseBits(value, 31, 1);
    };
    var parseFloat32 = function(value) {
      return parseFloatFromBits(value, 23, 8);
    };
    var parseFloat64 = function(value) {
      return parseFloatFromBits(value, 52, 11);
    };
    var parseNumeric = function(value) {
      var sign = parseBits(value, 16, 32);
      if (sign == 49152) {
        return NaN;
      }
      var weight = Math.pow(1e4, parseBits(value, 16, 16));
      var result = 0;
      var digits = [];
      var ndigits = parseBits(value, 16);
      for (var i = 0; i < ndigits; i++) {
        result += parseBits(value, 16, 64 + 16 * i) * weight;
        weight /= 1e4;
      }
      var scale = Math.pow(10, parseBits(value, 16, 48));
      return (sign === 0 ? 1 : -1) * Math.round(result * scale) / scale;
    };
    var parseDate = function(isUTC, value) {
      var sign = parseBits(value, 1);
      var rawValue = parseBits(value, 63, 1);
      var result = new Date((sign === 0 ? 1 : -1) * rawValue / 1e3 + 9466848e5);
      if (!isUTC) {
        result.setTime(result.getTime() + result.getTimezoneOffset() * 6e4);
      }
      result.usec = rawValue % 1e3;
      result.getMicroSeconds = function() {
        return this.usec;
      };
      result.setMicroSeconds = function(value2) {
        this.usec = value2;
      };
      result.getUTCMicroSeconds = function() {
        return this.usec;
      };
      return result;
    };
    var parseArray = function(value) {
      var dim = parseBits(value, 32);
      var flags = parseBits(value, 32, 32);
      var elementType = parseBits(value, 32, 64);
      var offset = 96;
      var dims = [];
      for (var i = 0; i < dim; i++) {
        dims[i] = parseBits(value, 32, offset);
        offset += 32;
        offset += 32;
      }
      var parseElement = function(elementType2) {
        var length = parseBits(value, 32, offset);
        offset += 32;
        if (length == 4294967295) {
          return null;
        }
        var result;
        if (elementType2 == 23 || elementType2 == 20) {
          result = parseBits(value, length * 8, offset);
          offset += length * 8;
          return result;
        } else if (elementType2 == 25) {
          result = value.toString(this.encoding, offset >> 3, (offset += length << 3) >> 3);
          return result;
        } else {
          console.log("ERROR: ElementType not implemented: " + elementType2);
        }
      };
      var parse = function(dimension, elementType2) {
        var array = [];
        var i2;
        if (dimension.length > 1) {
          var count = dimension.shift();
          for (i2 = 0; i2 < count; i2++) {
            array[i2] = parse(dimension, elementType2);
          }
          dimension.unshift(count);
        } else {
          for (i2 = 0; i2 < dimension[0]; i2++) {
            array[i2] = parseElement(elementType2);
          }
        }
        return array;
      };
      return parse(dims, elementType);
    };
    var parseText = function(value) {
      return value.toString("utf8");
    };
    var parseBool = function(value) {
      if (value === null) return null;
      return parseBits(value, 8) > 0;
    };
    var init = function(register) {
      register(20, parseInt64);
      register(21, parseInt16);
      register(23, parseInt32);
      register(26, parseInt32);
      register(1700, parseNumeric);
      register(700, parseFloat32);
      register(701, parseFloat64);
      register(16, parseBool);
      register(1114, parseDate.bind(null, false));
      register(1184, parseDate.bind(null, true));
      register(1e3, parseArray);
      register(1007, parseArray);
      register(1016, parseArray);
      register(1008, parseArray);
      register(1009, parseArray);
      register(25, parseText);
    };
    module2.exports = {
      init
    };
  }
});

// node_modules/.pnpm/pg-types@2.2.0/node_modules/pg-types/lib/builtins.js
var require_builtins = __commonJS({
  "node_modules/.pnpm/pg-types@2.2.0/node_modules/pg-types/lib/builtins.js"(exports2, module2) {
    module2.exports = {
      BOOL: 16,
      BYTEA: 17,
      CHAR: 18,
      INT8: 20,
      INT2: 21,
      INT4: 23,
      REGPROC: 24,
      TEXT: 25,
      OID: 26,
      TID: 27,
      XID: 28,
      CID: 29,
      JSON: 114,
      XML: 142,
      PG_NODE_TREE: 194,
      SMGR: 210,
      PATH: 602,
      POLYGON: 604,
      CIDR: 650,
      FLOAT4: 700,
      FLOAT8: 701,
      ABSTIME: 702,
      RELTIME: 703,
      TINTERVAL: 704,
      CIRCLE: 718,
      MACADDR8: 774,
      MONEY: 790,
      MACADDR: 829,
      INET: 869,
      ACLITEM: 1033,
      BPCHAR: 1042,
      VARCHAR: 1043,
      DATE: 1082,
      TIME: 1083,
      TIMESTAMP: 1114,
      TIMESTAMPTZ: 1184,
      INTERVAL: 1186,
      TIMETZ: 1266,
      BIT: 1560,
      VARBIT: 1562,
      NUMERIC: 1700,
      REFCURSOR: 1790,
      REGPROCEDURE: 2202,
      REGOPER: 2203,
      REGOPERATOR: 2204,
      REGCLASS: 2205,
      REGTYPE: 2206,
      UUID: 2950,
      TXID_SNAPSHOT: 2970,
      PG_LSN: 3220,
      PG_NDISTINCT: 3361,
      PG_DEPENDENCIES: 3402,
      TSVECTOR: 3614,
      TSQUERY: 3615,
      GTSVECTOR: 3642,
      REGCONFIG: 3734,
      REGDICTIONARY: 3769,
      JSONB: 3802,
      REGNAMESPACE: 4089,
      REGROLE: 4096
    };
  }
});

// node_modules/.pnpm/pg-types@2.2.0/node_modules/pg-types/index.js
var require_pg_types = __commonJS({
  "node_modules/.pnpm/pg-types@2.2.0/node_modules/pg-types/index.js"(exports2) {
    var textParsers = require_textParsers();
    var binaryParsers = require_binaryParsers();
    var arrayParser = require_arrayParser();
    var builtinTypes = require_builtins();
    exports2.getTypeParser = getTypeParser;
    exports2.setTypeParser = setTypeParser;
    exports2.arrayParser = arrayParser;
    exports2.builtins = builtinTypes;
    var typeParsers = {
      text: {},
      binary: {}
    };
    function noParse(val) {
      return String(val);
    }
    function getTypeParser(oid, format) {
      format = format || "text";
      if (!typeParsers[format]) {
        return noParse;
      }
      return typeParsers[format][oid] || noParse;
    }
    function setTypeParser(oid, format, parseFn) {
      if (typeof format == "function") {
        parseFn = format;
        format = "text";
      }
      typeParsers[format][oid] = parseFn;
    }
    textParsers.init(function(oid, converter) {
      typeParsers.text[oid] = converter;
    });
    binaryParsers.init(function(oid, converter) {
      typeParsers.binary[oid] = converter;
    });
  }
});

// node_modules/.pnpm/pg@8.18.0/node_modules/pg/lib/defaults.js
var require_defaults = __commonJS({
  "node_modules/.pnpm/pg@8.18.0/node_modules/pg/lib/defaults.js"(exports2, module2) {
    "use strict";
    var user;
    try {
      user = process.platform === "win32" ? process.env.USERNAME : process.env.USER;
    } catch {
    }
    module2.exports = {
      // database host. defaults to localhost
      host: "localhost",
      // database user's name
      user,
      // name of database to connect
      database: void 0,
      // database user's password
      password: null,
      // a Postgres connection string to be used instead of setting individual connection items
      // NOTE:  Setting this value will cause it to override any other value (such as database or user) defined
      // in the defaults object.
      connectionString: void 0,
      // database port
      port: 5432,
      // number of rows to return at a time from a prepared statement's
      // portal. 0 will return all rows at once
      rows: 0,
      // binary result mode
      binary: false,
      // Connection pool options - see https://github.com/brianc/node-pg-pool
      // number of connections to use in connection pool
      // 0 will disable connection pooling
      max: 10,
      // max milliseconds a client can go unused before it is removed
      // from the pool and destroyed
      idleTimeoutMillis: 3e4,
      client_encoding: "",
      ssl: false,
      application_name: void 0,
      fallback_application_name: void 0,
      options: void 0,
      parseInputDatesAsUTC: false,
      // max milliseconds any query using this connection will execute for before timing out in error.
      // false=unlimited
      statement_timeout: false,
      // Abort any statement that waits longer than the specified duration in milliseconds while attempting to acquire a lock.
      // false=unlimited
      lock_timeout: false,
      // Terminate any session with an open transaction that has been idle for longer than the specified duration in milliseconds
      // false=unlimited
      idle_in_transaction_session_timeout: false,
      // max milliseconds to wait for query to complete (client side)
      query_timeout: false,
      connect_timeout: 0,
      keepalives: 1,
      keepalives_idle: 0
    };
    var pgTypes = require_pg_types();
    var parseBigInteger = pgTypes.getTypeParser(20, "text");
    var parseBigIntegerArray = pgTypes.getTypeParser(1016, "text");
    module2.exports.__defineSetter__("parseInt8", function(val) {
      pgTypes.setTypeParser(20, "text", val ? pgTypes.getTypeParser(23, "text") : parseBigInteger);
      pgTypes.setTypeParser(1016, "text", val ? pgTypes.getTypeParser(1007, "text") : parseBigIntegerArray);
    });
  }
});

// node_modules/.pnpm/pg@8.18.0/node_modules/pg/lib/utils.js
var require_utils = __commonJS({
  "node_modules/.pnpm/pg@8.18.0/node_modules/pg/lib/utils.js"(exports2, module2) {
    "use strict";
    var defaults = require_defaults();
    var util = require("util");
    var { isDate } = util.types || util;
    function escapeElement(elementRepresentation) {
      const escaped = elementRepresentation.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
      return '"' + escaped + '"';
    }
    function arrayString(val) {
      let result = "{";
      for (let i = 0; i < val.length; i++) {
        if (i > 0) {
          result = result + ",";
        }
        if (val[i] === null || typeof val[i] === "undefined") {
          result = result + "NULL";
        } else if (Array.isArray(val[i])) {
          result = result + arrayString(val[i]);
        } else if (ArrayBuffer.isView(val[i])) {
          let item = val[i];
          if (!(item instanceof Buffer)) {
            const buf = Buffer.from(item.buffer, item.byteOffset, item.byteLength);
            if (buf.length === item.byteLength) {
              item = buf;
            } else {
              item = buf.slice(item.byteOffset, item.byteOffset + item.byteLength);
            }
          }
          result += "\\\\x" + item.toString("hex");
        } else {
          result += escapeElement(prepareValue(val[i]));
        }
      }
      result = result + "}";
      return result;
    }
    var prepareValue = function(val, seen) {
      if (val == null) {
        return null;
      }
      if (typeof val === "object") {
        if (val instanceof Buffer) {
          return val;
        }
        if (ArrayBuffer.isView(val)) {
          const buf = Buffer.from(val.buffer, val.byteOffset, val.byteLength);
          if (buf.length === val.byteLength) {
            return buf;
          }
          return buf.slice(val.byteOffset, val.byteOffset + val.byteLength);
        }
        if (isDate(val)) {
          if (defaults.parseInputDatesAsUTC) {
            return dateToStringUTC(val);
          } else {
            return dateToString(val);
          }
        }
        if (Array.isArray(val)) {
          return arrayString(val);
        }
        return prepareObject(val, seen);
      }
      return val.toString();
    };
    function prepareObject(val, seen) {
      if (val && typeof val.toPostgres === "function") {
        seen = seen || [];
        if (seen.indexOf(val) !== -1) {
          throw new Error('circular reference detected while preparing "' + val + '" for query');
        }
        seen.push(val);
        return prepareValue(val.toPostgres(prepareValue), seen);
      }
      return JSON.stringify(val);
    }
    function dateToString(date) {
      let offset = -date.getTimezoneOffset();
      let year = date.getFullYear();
      const isBCYear = year < 1;
      if (isBCYear) year = Math.abs(year) + 1;
      let ret = String(year).padStart(4, "0") + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0") + "T" + String(date.getHours()).padStart(2, "0") + ":" + String(date.getMinutes()).padStart(2, "0") + ":" + String(date.getSeconds()).padStart(2, "0") + "." + String(date.getMilliseconds()).padStart(3, "0");
      if (offset < 0) {
        ret += "-";
        offset *= -1;
      } else {
        ret += "+";
      }
      ret += String(Math.floor(offset / 60)).padStart(2, "0") + ":" + String(offset % 60).padStart(2, "0");
      if (isBCYear) ret += " BC";
      return ret;
    }
    function dateToStringUTC(date) {
      let year = date.getUTCFullYear();
      const isBCYear = year < 1;
      if (isBCYear) year = Math.abs(year) + 1;
      let ret = String(year).padStart(4, "0") + "-" + String(date.getUTCMonth() + 1).padStart(2, "0") + "-" + String(date.getUTCDate()).padStart(2, "0") + "T" + String(date.getUTCHours()).padStart(2, "0") + ":" + String(date.getUTCMinutes()).padStart(2, "0") + ":" + String(date.getUTCSeconds()).padStart(2, "0") + "." + String(date.getUTCMilliseconds()).padStart(3, "0");
      ret += "+00:00";
      if (isBCYear) ret += " BC";
      return ret;
    }
    function normalizeQueryConfig(config, values, callback) {
      config = typeof config === "string" ? { text: config } : config;
      if (values) {
        if (typeof values === "function") {
          config.callback = values;
        } else {
          config.values = values;
        }
      }
      if (callback) {
        config.callback = callback;
      }
      return config;
    }
    var escapeIdentifier = function(str) {
      return '"' + str.replace(/"/g, '""') + '"';
    };
    var escapeLiteral = function(str) {
      let hasBackslash = false;
      let escaped = "'";
      if (str == null) {
        return "''";
      }
      if (typeof str !== "string") {
        return "''";
      }
      for (let i = 0; i < str.length; i++) {
        const c = str[i];
        if (c === "'") {
          escaped += c + c;
        } else if (c === "\\") {
          escaped += c + c;
          hasBackslash = true;
        } else {
          escaped += c;
        }
      }
      escaped += "'";
      if (hasBackslash === true) {
        escaped = " E" + escaped;
      }
      return escaped;
    };
    module2.exports = {
      prepareValue: function prepareValueWrapper(value) {
        return prepareValue(value);
      },
      normalizeQueryConfig,
      escapeIdentifier,
      escapeLiteral
    };
  }
});

// node_modules/.pnpm/pg@8.18.0/node_modules/pg/lib/crypto/utils-legacy.js
var require_utils_legacy = __commonJS({
  "node_modules/.pnpm/pg@8.18.0/node_modules/pg/lib/crypto/utils-legacy.js"(exports2, module2) {
    "use strict";
    var nodeCrypto = require("crypto");
    function md5(string) {
      return nodeCrypto.createHash("md5").update(string, "utf-8").digest("hex");
    }
    function postgresMd5PasswordHash(user, password, salt) {
      const inner = md5(password + user);
      const outer = md5(Buffer.concat([Buffer.from(inner), salt]));
      return "md5" + outer;
    }
    function sha256(text) {
      return nodeCrypto.createHash("sha256").update(text).digest();
    }
    function hashByName(hashName, text) {
      hashName = hashName.replace(/(\D)-/, "$1");
      return nodeCrypto.createHash(hashName).update(text).digest();
    }
    function hmacSha256(key, msg) {
      return nodeCrypto.createHmac("sha256", key).update(msg).digest();
    }
    async function deriveKey(password, salt, iterations) {
      return nodeCrypto.pbkdf2Sync(password, salt, iterations, 32, "sha256");
    }
    module2.exports = {
      postgresMd5PasswordHash,
      randomBytes: nodeCrypto.randomBytes,
      deriveKey,
      sha256,
      hashByName,
      hmacSha256,
      md5
    };
  }
});

// node_modules/.pnpm/pg@8.18.0/node_modules/pg/lib/crypto/utils-webcrypto.js
var require_utils_webcrypto = __commonJS({
  "node_modules/.pnpm/pg@8.18.0/node_modules/pg/lib/crypto/utils-webcrypto.js"(exports2, module2) {
    var nodeCrypto = require("crypto");
    module2.exports = {
      postgresMd5PasswordHash,
      randomBytes,
      deriveKey,
      sha256,
      hashByName,
      hmacSha256,
      md5
    };
    var webCrypto = nodeCrypto.webcrypto || globalThis.crypto;
    var subtleCrypto = webCrypto.subtle;
    var textEncoder = new TextEncoder();
    function randomBytes(length) {
      return webCrypto.getRandomValues(Buffer.alloc(length));
    }
    async function md5(string) {
      try {
        return nodeCrypto.createHash("md5").update(string, "utf-8").digest("hex");
      } catch (e) {
        const data = typeof string === "string" ? textEncoder.encode(string) : string;
        const hash = await subtleCrypto.digest("MD5", data);
        return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
      }
    }
    async function postgresMd5PasswordHash(user, password, salt) {
      const inner = await md5(password + user);
      const outer = await md5(Buffer.concat([Buffer.from(inner), salt]));
      return "md5" + outer;
    }
    async function sha256(text) {
      return await subtleCrypto.digest("SHA-256", text);
    }
    async function hashByName(hashName, text) {
      return await subtleCrypto.digest(hashName, text);
    }
    async function hmacSha256(keyBuffer, msg) {
      const key = await subtleCrypto.importKey("raw", keyBuffer, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
      return await subtleCrypto.sign("HMAC", key, textEncoder.encode(msg));
    }
    async function deriveKey(password, salt, iterations) {
      const key = await subtleCrypto.importKey("raw", textEncoder.encode(password), "PBKDF2", false, ["deriveBits"]);
      const params = { name: "PBKDF2", hash: "SHA-256", salt, iterations };
      return await subtleCrypto.deriveBits(params, key, 32 * 8, ["deriveBits"]);
    }
  }
});

// node_modules/.pnpm/pg@8.18.0/node_modules/pg/lib/crypto/utils.js
var require_utils2 = __commonJS({
  "node_modules/.pnpm/pg@8.18.0/node_modules/pg/lib/crypto/utils.js"(exports2, module2) {
    "use strict";
    var useLegacyCrypto = parseInt(process.versions && process.versions.node && process.versions.node.split(".")[0]) < 15;
    if (useLegacyCrypto) {
      module2.exports = require_utils_legacy();
    } else {
      module2.exports = require_utils_webcrypto();
    }
  }
});

// node_modules/.pnpm/pg@8.18.0/node_modules/pg/lib/crypto/cert-signatures.js
var require_cert_signatures = __commonJS({
  "node_modules/.pnpm/pg@8.18.0/node_modules/pg/lib/crypto/cert-signatures.js"(exports2, module2) {
    function x509Error(msg, cert) {
      return new Error("SASL channel binding: " + msg + " when parsing public certificate " + cert.toString("base64"));
    }
    function readASN1Length(data, index) {
      let length = data[index++];
      if (length < 128) return { length, index };
      const lengthBytes = length & 127;
      if (lengthBytes > 4) throw x509Error("bad length", data);
      length = 0;
      for (let i = 0; i < lengthBytes; i++) {
        length = length << 8 | data[index++];
      }
      return { length, index };
    }
    function readASN1OID(data, index) {
      if (data[index++] !== 6) throw x509Error("non-OID data", data);
      const { length: OIDLength, index: indexAfterOIDLength } = readASN1Length(data, index);
      index = indexAfterOIDLength;
      const lastIndex = index + OIDLength;
      const byte1 = data[index++];
      let oid = (byte1 / 40 >> 0) + "." + byte1 % 40;
      while (index < lastIndex) {
        let value = 0;
        while (index < lastIndex) {
          const nextByte = data[index++];
          value = value << 7 | nextByte & 127;
          if (nextByte < 128) break;
        }
        oid += "." + value;
      }
      return { oid, index };
    }
    function expectASN1Seq(data, index) {
      if (data[index++] !== 48) throw x509Error("non-sequence data", data);
      return readASN1Length(data, index);
    }
    function signatureAlgorithmHashFromCertificate(data, index) {
      if (index === void 0) index = 0;
      index = expectASN1Seq(data, index).index;
      const { length: certInfoLength, index: indexAfterCertInfoLength } = expectASN1Seq(data, index);
      index = indexAfterCertInfoLength + certInfoLength;
      index = expectASN1Seq(data, index).index;
      const { oid, index: indexAfterOID } = readASN1OID(data, index);
      switch (oid) {
        // RSA
        case "1.2.840.113549.1.1.4":
          return "MD5";
        case "1.2.840.113549.1.1.5":
          return "SHA-1";
        case "1.2.840.113549.1.1.11":
          return "SHA-256";
        case "1.2.840.113549.1.1.12":
          return "SHA-384";
        case "1.2.840.113549.1.1.13":
          return "SHA-512";
        case "1.2.840.113549.1.1.14":
          return "SHA-224";
        case "1.2.840.113549.1.1.15":
          return "SHA512-224";
        case "1.2.840.113549.1.1.16":
          return "SHA512-256";
        // ECDSA
        case "1.2.840.10045.4.1":
          return "SHA-1";
        case "1.2.840.10045.4.3.1":
          return "SHA-224";
        case "1.2.840.10045.4.3.2":
          return "SHA-256";
        case "1.2.840.10045.4.3.3":
          return "SHA-384";
        case "1.2.840.10045.4.3.4":
          return "SHA-512";
        // RSASSA-PSS: hash is indicated separately
        case "1.2.840.113549.1.1.10": {
          index = indexAfterOID;
          index = expectASN1Seq(data, index).index;
          if (data[index++] !== 160) throw x509Error("non-tag data", data);
          index = readASN1Length(data, index).index;
          index = expectASN1Seq(data, index).index;
          const { oid: hashOID } = readASN1OID(data, index);
          switch (hashOID) {
            // standalone hash OIDs
            case "1.2.840.113549.2.5":
              return "MD5";
            case "1.3.14.3.2.26":
              return "SHA-1";
            case "2.16.840.1.101.3.4.2.1":
              return "SHA-256";
            case "2.16.840.1.101.3.4.2.2":
              return "SHA-384";
            case "2.16.840.1.101.3.4.2.3":
              return "SHA-512";
          }
          throw x509Error("unknown hash OID " + hashOID, data);
        }
        // Ed25519 -- see https: return//github.com/openssl/openssl/issues/15477
        case "1.3.101.110":
        case "1.3.101.112":
          return "SHA-512";
        // Ed448 -- still not in pg 17.2 (if supported, digest would be SHAKE256 x 64 bytes)
        case "1.3.101.111":
        case "1.3.101.113":
          throw x509Error("Ed448 certificate channel binding is not currently supported by Postgres");
      }
      throw x509Error("unknown OID " + oid, data);
    }
    module2.exports = { signatureAlgorithmHashFromCertificate };
  }
});

// node_modules/.pnpm/pg@8.18.0/node_modules/pg/lib/crypto/sasl.js
var require_sasl = __commonJS({
  "node_modules/.pnpm/pg@8.18.0/node_modules/pg/lib/crypto/sasl.js"(exports2, module2) {
    "use strict";
    var crypto = require_utils2();
    var { signatureAlgorithmHashFromCertificate } = require_cert_signatures();
    function startSession(mechanisms, stream) {
      const candidates = ["SCRAM-SHA-256"];
      if (stream) candidates.unshift("SCRAM-SHA-256-PLUS");
      const mechanism = candidates.find((candidate) => mechanisms.includes(candidate));
      if (!mechanism) {
        throw new Error("SASL: Only mechanism(s) " + candidates.join(" and ") + " are supported");
      }
      if (mechanism === "SCRAM-SHA-256-PLUS" && typeof stream.getPeerCertificate !== "function") {
        throw new Error("SASL: Mechanism SCRAM-SHA-256-PLUS requires a certificate");
      }
      const clientNonce = crypto.randomBytes(18).toString("base64");
      const gs2Header = mechanism === "SCRAM-SHA-256-PLUS" ? "p=tls-server-end-point" : stream ? "y" : "n";
      return {
        mechanism,
        clientNonce,
        response: gs2Header + ",,n=*,r=" + clientNonce,
        message: "SASLInitialResponse"
      };
    }
    async function continueSession(session2, password, serverData, stream) {
      if (session2.message !== "SASLInitialResponse") {
        throw new Error("SASL: Last message was not SASLInitialResponse");
      }
      if (typeof password !== "string") {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string");
      }
      if (password === "") {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a non-empty string");
      }
      if (typeof serverData !== "string") {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: serverData must be a string");
      }
      const sv = parseServerFirstMessage(serverData);
      if (!sv.nonce.startsWith(session2.clientNonce)) {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce does not start with client nonce");
      } else if (sv.nonce.length === session2.clientNonce.length) {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce is too short");
      }
      const clientFirstMessageBare = "n=*,r=" + session2.clientNonce;
      const serverFirstMessage = "r=" + sv.nonce + ",s=" + sv.salt + ",i=" + sv.iteration;
      let channelBinding = stream ? "eSws" : "biws";
      if (session2.mechanism === "SCRAM-SHA-256-PLUS") {
        const peerCert = stream.getPeerCertificate().raw;
        let hashName = signatureAlgorithmHashFromCertificate(peerCert);
        if (hashName === "MD5" || hashName === "SHA-1") hashName = "SHA-256";
        const certHash = await crypto.hashByName(hashName, peerCert);
        const bindingData = Buffer.concat([Buffer.from("p=tls-server-end-point,,"), Buffer.from(certHash)]);
        channelBinding = bindingData.toString("base64");
      }
      const clientFinalMessageWithoutProof = "c=" + channelBinding + ",r=" + sv.nonce;
      const authMessage = clientFirstMessageBare + "," + serverFirstMessage + "," + clientFinalMessageWithoutProof;
      const saltBytes = Buffer.from(sv.salt, "base64");
      const saltedPassword = await crypto.deriveKey(password, saltBytes, sv.iteration);
      const clientKey = await crypto.hmacSha256(saltedPassword, "Client Key");
      const storedKey = await crypto.sha256(clientKey);
      const clientSignature = await crypto.hmacSha256(storedKey, authMessage);
      const clientProof = xorBuffers(Buffer.from(clientKey), Buffer.from(clientSignature)).toString("base64");
      const serverKey = await crypto.hmacSha256(saltedPassword, "Server Key");
      const serverSignatureBytes = await crypto.hmacSha256(serverKey, authMessage);
      session2.message = "SASLResponse";
      session2.serverSignature = Buffer.from(serverSignatureBytes).toString("base64");
      session2.response = clientFinalMessageWithoutProof + ",p=" + clientProof;
    }
    function finalizeSession(session2, serverData) {
      if (session2.message !== "SASLResponse") {
        throw new Error("SASL: Last message was not SASLResponse");
      }
      if (typeof serverData !== "string") {
        throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: serverData must be a string");
      }
      const { serverSignature } = parseServerFinalMessage(serverData);
      if (serverSignature !== session2.serverSignature) {
        throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature does not match");
      }
    }
    function isPrintableChars(text) {
      if (typeof text !== "string") {
        throw new TypeError("SASL: text must be a string");
      }
      return text.split("").map((_, i) => text.charCodeAt(i)).every((c) => c >= 33 && c <= 43 || c >= 45 && c <= 126);
    }
    function isBase64(text) {
      return /^(?:[a-zA-Z0-9+/]{4})*(?:[a-zA-Z0-9+/]{2}==|[a-zA-Z0-9+/]{3}=)?$/.test(text);
    }
    function parseAttributePairs(text) {
      if (typeof text !== "string") {
        throw new TypeError("SASL: attribute pairs text must be a string");
      }
      return new Map(
        text.split(",").map((attrValue) => {
          if (!/^.=/.test(attrValue)) {
            throw new Error("SASL: Invalid attribute pair entry");
          }
          const name = attrValue[0];
          const value = attrValue.substring(2);
          return [name, value];
        })
      );
    }
    function parseServerFirstMessage(data) {
      const attrPairs = parseAttributePairs(data);
      const nonce = attrPairs.get("r");
      if (!nonce) {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce missing");
      } else if (!isPrintableChars(nonce)) {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce must only contain printable characters");
      }
      const salt = attrPairs.get("s");
      if (!salt) {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: salt missing");
      } else if (!isBase64(salt)) {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: salt must be base64");
      }
      const iterationText = attrPairs.get("i");
      if (!iterationText) {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: iteration missing");
      } else if (!/^[1-9][0-9]*$/.test(iterationText)) {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: invalid iteration count");
      }
      const iteration = parseInt(iterationText, 10);
      return {
        nonce,
        salt,
        iteration
      };
    }
    function parseServerFinalMessage(serverData) {
      const attrPairs = parseAttributePairs(serverData);
      const serverSignature = attrPairs.get("v");
      if (!serverSignature) {
        throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature is missing");
      } else if (!isBase64(serverSignature)) {
        throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature must be base64");
      }
      return {
        serverSignature
      };
    }
    function xorBuffers(a, b) {
      if (!Buffer.isBuffer(a)) {
        throw new TypeError("first argument must be a Buffer");
      }
      if (!Buffer.isBuffer(b)) {
        throw new TypeError("second argument must be a Buffer");
      }
      if (a.length !== b.length) {
        throw new Error("Buffer lengths must match");
      }
      if (a.length === 0) {
        throw new Error("Buffers cannot be empty");
      }
      return Buffer.from(a.map((_, i) => a[i] ^ b[i]));
    }
    module2.exports = {
      startSession,
      continueSession,
      finalizeSession
    };
  }
});

// node_modules/.pnpm/pg@8.18.0/node_modules/pg/lib/type-overrides.js
var require_type_overrides = __commonJS({
  "node_modules/.pnpm/pg@8.18.0/node_modules/pg/lib/type-overrides.js"(exports2, module2) {
    "use strict";
    var types = require_pg_types();
    function TypeOverrides(userTypes) {
      this._types = userTypes || types;
      this.text = {};
      this.binary = {};
    }
    TypeOverrides.prototype.getOverrides = function(format) {
      switch (format) {
        case "text":
          return this.text;
        case "binary":
          return this.binary;
        default:
          return {};
      }
    };
    TypeOverrides.prototype.setTypeParser = function(oid, format, parseFn) {
      if (typeof format === "function") {
        parseFn = format;
        format = "text";
      }
      this.getOverrides(format)[oid] = parseFn;
    };
    TypeOverrides.prototype.getTypeParser = function(oid, format) {
      format = format || "text";
      return this.getOverrides(format)[oid] || this._types.getTypeParser(oid, format);
    };
    module2.exports = TypeOverrides;
  }
});

// node_modules/.pnpm/pg-connection-string@2.11.0/node_modules/pg-connection-string/index.js
var require_pg_connection_string = __commonJS({
  "node_modules/.pnpm/pg-connection-string@2.11.0/node_modules/pg-connection-string/index.js"(exports2, module2) {
    "use strict";
    function parse(str, options = {}) {
      if (str.charAt(0) === "/") {
        const config2 = str.split(" ");
        return { host: config2[0], database: config2[1] };
      }
      const config = {};
      let result;
      let dummyHost = false;
      if (/ |%[^a-f0-9]|%[a-f0-9][^a-f0-9]/i.test(str)) {
        str = encodeURI(str).replace(/%25(\d\d)/g, "%$1");
      }
      try {
        try {
          result = new URL(str, "postgres://base");
        } catch (e) {
          result = new URL(str.replace("@/", "@___DUMMY___/"), "postgres://base");
          dummyHost = true;
        }
      } catch (err) {
        err.input && (err.input = "*****REDACTED*****");
        throw err;
      }
      for (const entry of result.searchParams.entries()) {
        config[entry[0]] = entry[1];
      }
      config.user = config.user || decodeURIComponent(result.username);
      config.password = config.password || decodeURIComponent(result.password);
      if (result.protocol == "socket:") {
        config.host = decodeURI(result.pathname);
        config.database = result.searchParams.get("db");
        config.client_encoding = result.searchParams.get("encoding");
        return config;
      }
      const hostname = dummyHost ? "" : result.hostname;
      if (!config.host) {
        config.host = decodeURIComponent(hostname);
      } else if (hostname && /^%2f/i.test(hostname)) {
        result.pathname = hostname + result.pathname;
      }
      if (!config.port) {
        config.port = result.port;
      }
      const pathname = result.pathname.slice(1) || null;
      config.database = pathname ? decodeURI(pathname) : null;
      if (config.ssl === "true" || config.ssl === "1") {
        config.ssl = true;
      }
      if (config.ssl === "0") {
        config.ssl = false;
      }
      if (config.sslcert || config.sslkey || config.sslrootcert || config.sslmode) {
        config.ssl = {};
      }
      const fs2 = config.sslcert || config.sslkey || config.sslrootcert ? require("fs") : null;
      if (config.sslcert) {
        config.ssl.cert = fs2.readFileSync(config.sslcert).toString();
      }
      if (config.sslkey) {
        config.ssl.key = fs2.readFileSync(config.sslkey).toString();
      }
      if (config.sslrootcert) {
        config.ssl.ca = fs2.readFileSync(config.sslrootcert).toString();
      }
      if (options.useLibpqCompat && config.uselibpqcompat) {
        throw new Error("Both useLibpqCompat and uselibpqcompat are set. Please use only one of them.");
      }
      if (config.uselibpqcompat === "true" || options.useLibpqCompat) {
        switch (config.sslmode) {
          case "disable": {
            config.ssl = false;
            break;
          }
          case "prefer": {
            config.ssl.rejectUnauthorized = false;
            break;
          }
          case "require": {
            if (config.sslrootcert) {
              config.ssl.checkServerIdentity = function() {
              };
            } else {
              config.ssl.rejectUnauthorized = false;
            }
            break;
          }
          case "verify-ca": {
            if (!config.ssl.ca) {
              throw new Error(
                "SECURITY WARNING: Using sslmode=verify-ca requires specifying a CA with sslrootcert. If a public CA is used, verify-ca allows connections to a server that somebody else may have registered with the CA, making you vulnerable to Man-in-the-Middle attacks. Either specify a custom CA certificate with sslrootcert parameter or use sslmode=verify-full for proper security."
              );
            }
            config.ssl.checkServerIdentity = function() {
            };
            break;
          }
          case "verify-full": {
            break;
          }
        }
      } else {
        switch (config.sslmode) {
          case "disable": {
            config.ssl = false;
            break;
          }
          case "prefer":
          case "require":
          case "verify-ca":
          case "verify-full": {
            if (config.sslmode !== "verify-full") {
              deprecatedSslModeWarning(config.sslmode);
            }
            break;
          }
          case "no-verify": {
            config.ssl.rejectUnauthorized = false;
            break;
          }
        }
      }
      return config;
    }
    function toConnectionOptions(sslConfig) {
      const connectionOptions = Object.entries(sslConfig).reduce((c, [key, value]) => {
        if (value !== void 0 && value !== null) {
          c[key] = value;
        }
        return c;
      }, {});
      return connectionOptions;
    }
    function toClientConfig(config) {
      const poolConfig = Object.entries(config).reduce((c, [key, value]) => {
        if (key === "ssl") {
          const sslConfig = value;
          if (typeof sslConfig === "boolean") {
            c[key] = sslConfig;
          }
          if (typeof sslConfig === "object") {
            c[key] = toConnectionOptions(sslConfig);
          }
        } else if (value !== void 0 && value !== null) {
          if (key === "port") {
            if (value !== "") {
              const v = parseInt(value, 10);
              if (isNaN(v)) {
                throw new Error(`Invalid ${key}: ${value}`);
              }
              c[key] = v;
            }
          } else {
            c[key] = value;
          }
        }
        return c;
      }, {});
      return poolConfig;
    }
    function parseIntoClientConfig(str) {
      return toClientConfig(parse(str));
    }
    function deprecatedSslModeWarning(sslmode) {
      if (!deprecatedSslModeWarning.warned && typeof process !== "undefined" && process.emitWarning) {
        deprecatedSslModeWarning.warned = true;
        process.emitWarning(`SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca' are treated as aliases for 'verify-full'.
In the next major version (pg-connection-string v3.0.0 and pg v9.0.0), these modes will adopt standard libpq semantics, which have weaker security guarantees.

To prepare for this change:
- If you want the current behavior, explicitly use 'sslmode=verify-full'
- If you want libpq compatibility now, use 'uselibpqcompat=true&sslmode=${sslmode}'

See https://www.postgresql.org/docs/current/libpq-ssl.html for libpq SSL mode definitions.`);
      }
    }
    module2.exports = parse;
    parse.parse = parse;
    parse.toClientConfig = toClientConfig;
    parse.parseIntoClientConfig = parseIntoClientConfig;
  }
});

// node_modules/.pnpm/pg@8.18.0/node_modules/pg/lib/connection-parameters.js
var require_connection_parameters = __commonJS({
  "node_modules/.pnpm/pg@8.18.0/node_modules/pg/lib/connection-parameters.js"(exports2, module2) {
    "use strict";
    var dns = require("dns");
    var defaults = require_defaults();
    var parse = require_pg_connection_string().parse;
    var val = function(key, config, envVar) {
      if (config[key]) {
        return config[key];
      }
      if (envVar === void 0) {
        envVar = process.env["PG" + key.toUpperCase()];
      } else if (envVar === false) {
      } else {
        envVar = process.env[envVar];
      }
      return envVar || defaults[key];
    };
    var readSSLConfigFromEnvironment = function() {
      switch (process.env.PGSSLMODE) {
        case "disable":
          return false;
        case "prefer":
        case "require":
        case "verify-ca":
        case "verify-full":
          return true;
        case "no-verify":
          return { rejectUnauthorized: false };
      }
      return defaults.ssl;
    };
    var quoteParamValue = function(value) {
      return "'" + ("" + value).replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
    };
    var add = function(params, config, paramName) {
      const value = config[paramName];
      if (value !== void 0 && value !== null) {
        params.push(paramName + "=" + quoteParamValue(value));
      }
    };
    var ConnectionParameters = class {
      constructor(config) {
        config = typeof config === "string" ? parse(config) : config || {};
        if (config.connectionString) {
          config = Object.assign({}, config, parse(config.connectionString));
        }
        this.user = val("user", config);
        this.database = val("database", config);
        if (this.database === void 0) {
          this.database = this.user;
        }
        this.port = parseInt(val("port", config), 10);
        this.host = val("host", config);
        Object.defineProperty(this, "password", {
          configurable: true,
          enumerable: false,
          writable: true,
          value: val("password", config)
        });
        this.binary = val("binary", config);
        this.options = val("options", config);
        this.ssl = typeof config.ssl === "undefined" ? readSSLConfigFromEnvironment() : config.ssl;
        if (typeof this.ssl === "string") {
          if (this.ssl === "true") {
            this.ssl = true;
          }
        }
        if (this.ssl === "no-verify") {
          this.ssl = { rejectUnauthorized: false };
        }
        if (this.ssl && this.ssl.key) {
          Object.defineProperty(this.ssl, "key", {
            enumerable: false
          });
        }
        this.client_encoding = val("client_encoding", config);
        this.replication = val("replication", config);
        this.isDomainSocket = !(this.host || "").indexOf("/");
        this.application_name = val("application_name", config, "PGAPPNAME");
        this.fallback_application_name = val("fallback_application_name", config, false);
        this.statement_timeout = val("statement_timeout", config, false);
        this.lock_timeout = val("lock_timeout", config, false);
        this.idle_in_transaction_session_timeout = val("idle_in_transaction_session_timeout", config, false);
        this.query_timeout = val("query_timeout", config, false);
        if (config.connectionTimeoutMillis === void 0) {
          this.connect_timeout = process.env.PGCONNECT_TIMEOUT || 0;
        } else {
          this.connect_timeout = Math.floor(config.connectionTimeoutMillis / 1e3);
        }
        if (config.keepAlive === false) {
          this.keepalives = 0;
        } else if (config.keepAlive === true) {
          this.keepalives = 1;
        }
        if (typeof config.keepAliveInitialDelayMillis === "number") {
          this.keepalives_idle = Math.floor(config.keepAliveInitialDelayMillis / 1e3);
        }
      }
      getLibpqConnectionString(cb) {
        const params = [];
        add(params, this, "user");
        add(params, this, "password");
        add(params, this, "port");
        add(params, this, "application_name");
        add(params, this, "fallback_application_name");
        add(params, this, "connect_timeout");
        add(params, this, "options");
        const ssl = typeof this.ssl === "object" ? this.ssl : this.ssl ? { sslmode: this.ssl } : {};
        add(params, ssl, "sslmode");
        add(params, ssl, "sslca");
        add(params, ssl, "sslkey");
        add(params, ssl, "sslcert");
        add(params, ssl, "sslrootcert");
        if (this.database) {
          params.push("dbname=" + quoteParamValue(this.database));
        }
        if (this.replication) {
          params.push("replication=" + quoteParamValue(this.replication));
        }
        if (this.host) {
          params.push("host=" + quoteParamValue(this.host));
        }
        if (this.isDomainSocket) {
          return cb(null, params.join(" "));
        }
        if (this.client_encoding) {
          params.push("client_encoding=" + quoteParamValue(this.client_encoding));
        }
        dns.lookup(this.host, function(err, address) {
          if (err) return cb(err, null);
          params.push("hostaddr=" + quoteParamValue(address));
          return cb(null, params.join(" "));
        });
      }
    };
    module2.exports = ConnectionParameters;
  }
});

// node_modules/.pnpm/pg@8.18.0/node_modules/pg/lib/result.js
var require_result = __commonJS({
  "node_modules/.pnpm/pg@8.18.0/node_modules/pg/lib/result.js"(exports2, module2) {
    "use strict";
    var types = require_pg_types();
    var matchRegexp = /^([A-Za-z]+)(?: (\d+))?(?: (\d+))?/;
    var Result = class {
      constructor(rowMode, types2) {
        this.command = null;
        this.rowCount = null;
        this.oid = null;
        this.rows = [];
        this.fields = [];
        this._parsers = void 0;
        this._types = types2;
        this.RowCtor = null;
        this.rowAsArray = rowMode === "array";
        if (this.rowAsArray) {
          this.parseRow = this._parseRowAsArray;
        }
        this._prebuiltEmptyResultObject = null;
      }
      // adds a command complete message
      addCommandComplete(msg) {
        let match;
        if (msg.text) {
          match = matchRegexp.exec(msg.text);
        } else {
          match = matchRegexp.exec(msg.command);
        }
        if (match) {
          this.command = match[1];
          if (match[3]) {
            this.oid = parseInt(match[2], 10);
            this.rowCount = parseInt(match[3], 10);
          } else if (match[2]) {
            this.rowCount = parseInt(match[2], 10);
          }
        }
      }
      _parseRowAsArray(rowData) {
        const row = new Array(rowData.length);
        for (let i = 0, len = rowData.length; i < len; i++) {
          const rawValue = rowData[i];
          if (rawValue !== null) {
            row[i] = this._parsers[i](rawValue);
          } else {
            row[i] = null;
          }
        }
        return row;
      }
      parseRow(rowData) {
        const row = { ...this._prebuiltEmptyResultObject };
        for (let i = 0, len = rowData.length; i < len; i++) {
          const rawValue = rowData[i];
          const field = this.fields[i].name;
          if (rawValue !== null) {
            const v = this.fields[i].format === "binary" ? Buffer.from(rawValue) : rawValue;
            row[field] = this._parsers[i](v);
          } else {
            row[field] = null;
          }
        }
        return row;
      }
      addRow(row) {
        this.rows.push(row);
      }
      addFields(fieldDescriptions) {
        this.fields = fieldDescriptions;
        if (this.fields.length) {
          this._parsers = new Array(fieldDescriptions.length);
        }
        const row = {};
        for (let i = 0; i < fieldDescriptions.length; i++) {
          const desc = fieldDescriptions[i];
          row[desc.name] = null;
          if (this._types) {
            this._parsers[i] = this._types.getTypeParser(desc.dataTypeID, desc.format || "text");
          } else {
            this._parsers[i] = types.getTypeParser(desc.dataTypeID, desc.format || "text");
          }
        }
        this._prebuiltEmptyResultObject = { ...row };
      }
    };
    module2.exports = Result;
  }
});

// node_modules/.pnpm/pg@8.18.0/node_modules/pg/lib/query.js
var require_query = __commonJS({
  "node_modules/.pnpm/pg@8.18.0/node_modules/pg/lib/query.js"(exports2, module2) {
    "use strict";
    var { EventEmitter } = require("events");
    var Result = require_result();
    var utils = require_utils();
    var Query = class extends EventEmitter {
      constructor(config, values, callback) {
        super();
        config = utils.normalizeQueryConfig(config, values, callback);
        this.text = config.text;
        this.values = config.values;
        this.rows = config.rows;
        this.types = config.types;
        this.name = config.name;
        this.queryMode = config.queryMode;
        this.binary = config.binary;
        this.portal = config.portal || "";
        this.callback = config.callback;
        this._rowMode = config.rowMode;
        if (process.domain && config.callback) {
          this.callback = process.domain.bind(config.callback);
        }
        this._result = new Result(this._rowMode, this.types);
        this._results = this._result;
        this._canceledDueToError = false;
      }
      requiresPreparation() {
        if (this.queryMode === "extended") {
          return true;
        }
        if (this.name) {
          return true;
        }
        if (this.rows) {
          return true;
        }
        if (!this.text) {
          return false;
        }
        if (!this.values) {
          return false;
        }
        return this.values.length > 0;
      }
      _checkForMultirow() {
        if (this._result.command) {
          if (!Array.isArray(this._results)) {
            this._results = [this._result];
          }
          this._result = new Result(this._rowMode, this._result._types);
          this._results.push(this._result);
        }
      }
      // associates row metadata from the supplied
      // message with this query object
      // metadata used when parsing row results
      handleRowDescription(msg) {
        this._checkForMultirow();
        this._result.addFields(msg.fields);
        this._accumulateRows = this.callback || !this.listeners("row").length;
      }
      handleDataRow(msg) {
        let row;
        if (this._canceledDueToError) {
          return;
        }
        try {
          row = this._result.parseRow(msg.fields);
        } catch (err) {
          this._canceledDueToError = err;
          return;
        }
        this.emit("row", row, this._result);
        if (this._accumulateRows) {
          this._result.addRow(row);
        }
      }
      handleCommandComplete(msg, connection) {
        this._checkForMultirow();
        this._result.addCommandComplete(msg);
        if (this.rows) {
          connection.sync();
        }
      }
      // if a named prepared statement is created with empty query text
      // the backend will send an emptyQuery message but *not* a command complete message
      // since we pipeline sync immediately after execute we don't need to do anything here
      // unless we have rows specified, in which case we did not pipeline the initial sync call
      handleEmptyQuery(connection) {
        if (this.rows) {
          connection.sync();
        }
      }
      handleError(err, connection) {
        if (this._canceledDueToError) {
          err = this._canceledDueToError;
          this._canceledDueToError = false;
        }
        if (this.callback) {
          return this.callback(err);
        }
        this.emit("error", err);
      }
      handleReadyForQuery(con) {
        if (this._canceledDueToError) {
          return this.handleError(this._canceledDueToError, con);
        }
        if (this.callback) {
          try {
            this.callback(null, this._results);
          } catch (err) {
            process.nextTick(() => {
              throw err;
            });
          }
        }
        this.emit("end", this._results);
      }
      submit(connection) {
        if (typeof this.text !== "string" && typeof this.name !== "string") {
          return new Error("A query must have either text or a name. Supplying neither is unsupported.");
        }
        const previous = connection.parsedStatements[this.name];
        if (this.text && previous && this.text !== previous) {
          return new Error(`Prepared statements must be unique - '${this.name}' was used for a different statement`);
        }
        if (this.values && !Array.isArray(this.values)) {
          return new Error("Query values must be an array");
        }
        if (this.requiresPreparation()) {
          connection.stream.cork && connection.stream.cork();
          try {
            this.prepare(connection);
          } finally {
            connection.stream.uncork && connection.stream.uncork();
          }
        } else {
          connection.query(this.text);
        }
        return null;
      }
      hasBeenParsed(connection) {
        return this.name && connection.parsedStatements[this.name];
      }
      handlePortalSuspended(connection) {
        this._getRows(connection, this.rows);
      }
      _getRows(connection, rows) {
        connection.execute({
          portal: this.portal,
          rows
        });
        if (!rows) {
          connection.sync();
        } else {
          connection.flush();
        }
      }
      // http://developer.postgresql.org/pgdocs/postgres/protocol-flow.html#PROTOCOL-FLOW-EXT-QUERY
      prepare(connection) {
        if (!this.hasBeenParsed(connection)) {
          connection.parse({
            text: this.text,
            name: this.name,
            types: this.types
          });
        }
        try {
          connection.bind({
            portal: this.portal,
            statement: this.name,
            values: this.values,
            binary: this.binary,
            valueMapper: utils.prepareValue
          });
        } catch (err) {
          this.handleError(err, connection);
          return;
        }
        connection.describe({
          type: "P",
          name: this.portal || ""
        });
        this._getRows(connection, this.rows);
      }
      handleCopyInResponse(connection) {
        connection.sendCopyFail("No source stream defined");
      }
      handleCopyData(msg, connection) {
      }
    };
    module2.exports = Query;
  }
});

// node_modules/.pnpm/pg-protocol@1.11.0/node_modules/pg-protocol/dist/messages.js
var require_messages = __commonJS({
  "node_modules/.pnpm/pg-protocol@1.11.0/node_modules/pg-protocol/dist/messages.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.NoticeMessage = exports2.DataRowMessage = exports2.CommandCompleteMessage = exports2.ReadyForQueryMessage = exports2.NotificationResponseMessage = exports2.BackendKeyDataMessage = exports2.AuthenticationMD5Password = exports2.ParameterStatusMessage = exports2.ParameterDescriptionMessage = exports2.RowDescriptionMessage = exports2.Field = exports2.CopyResponse = exports2.CopyDataMessage = exports2.DatabaseError = exports2.copyDone = exports2.emptyQuery = exports2.replicationStart = exports2.portalSuspended = exports2.noData = exports2.closeComplete = exports2.bindComplete = exports2.parseComplete = void 0;
    exports2.parseComplete = {
      name: "parseComplete",
      length: 5
    };
    exports2.bindComplete = {
      name: "bindComplete",
      length: 5
    };
    exports2.closeComplete = {
      name: "closeComplete",
      length: 5
    };
    exports2.noData = {
      name: "noData",
      length: 5
    };
    exports2.portalSuspended = {
      name: "portalSuspended",
      length: 5
    };
    exports2.replicationStart = {
      name: "replicationStart",
      length: 4
    };
    exports2.emptyQuery = {
      name: "emptyQuery",
      length: 4
    };
    exports2.copyDone = {
      name: "copyDone",
      length: 4
    };
    var DatabaseError = class extends Error {
      constructor(message, length, name) {
        super(message);
        this.length = length;
        this.name = name;
      }
    };
    exports2.DatabaseError = DatabaseError;
    var CopyDataMessage = class {
      constructor(length, chunk) {
        this.length = length;
        this.chunk = chunk;
        this.name = "copyData";
      }
    };
    exports2.CopyDataMessage = CopyDataMessage;
    var CopyResponse = class {
      constructor(length, name, binary, columnCount) {
        this.length = length;
        this.name = name;
        this.binary = binary;
        this.columnTypes = new Array(columnCount);
      }
    };
    exports2.CopyResponse = CopyResponse;
    var Field = class {
      constructor(name, tableID, columnID, dataTypeID, dataTypeSize, dataTypeModifier, format) {
        this.name = name;
        this.tableID = tableID;
        this.columnID = columnID;
        this.dataTypeID = dataTypeID;
        this.dataTypeSize = dataTypeSize;
        this.dataTypeModifier = dataTypeModifier;
        this.format = format;
      }
    };
    exports2.Field = Field;
    var RowDescriptionMessage = class {
      constructor(length, fieldCount) {
        this.length = length;
        this.fieldCount = fieldCount;
        this.name = "rowDescription";
        this.fields = new Array(this.fieldCount);
      }
    };
    exports2.RowDescriptionMessage = RowDescriptionMessage;
    var ParameterDescriptionMessage = class {
      constructor(length, parameterCount) {
        this.length = length;
        this.parameterCount = parameterCount;
        this.name = "parameterDescription";
        this.dataTypeIDs = new Array(this.parameterCount);
      }
    };
    exports2.ParameterDescriptionMessage = ParameterDescriptionMessage;
    var ParameterStatusMessage = class {
      constructor(length, parameterName, parameterValue) {
        this.length = length;
        this.parameterName = parameterName;
        this.parameterValue = parameterValue;
        this.name = "parameterStatus";
      }
    };
    exports2.ParameterStatusMessage = ParameterStatusMessage;
    var AuthenticationMD5Password = class {
      constructor(length, salt) {
        this.length = length;
        this.salt = salt;
        this.name = "authenticationMD5Password";
      }
    };
    exports2.AuthenticationMD5Password = AuthenticationMD5Password;
    var BackendKeyDataMessage = class {
      constructor(length, processID, secretKey) {
        this.length = length;
        this.processID = processID;
        this.secretKey = secretKey;
        this.name = "backendKeyData";
      }
    };
    exports2.BackendKeyDataMessage = BackendKeyDataMessage;
    var NotificationResponseMessage = class {
      constructor(length, processId, channel, payload) {
        this.length = length;
        this.processId = processId;
        this.channel = channel;
        this.payload = payload;
        this.name = "notification";
      }
    };
    exports2.NotificationResponseMessage = NotificationResponseMessage;
    var ReadyForQueryMessage = class {
      constructor(length, status) {
        this.length = length;
        this.status = status;
        this.name = "readyForQuery";
      }
    };
    exports2.ReadyForQueryMessage = ReadyForQueryMessage;
    var CommandCompleteMessage = class {
      constructor(length, text) {
        this.length = length;
        this.text = text;
        this.name = "commandComplete";
      }
    };
    exports2.CommandCompleteMessage = CommandCompleteMessage;
    var DataRowMessage = class {
      constructor(length, fields) {
        this.length = length;
        this.fields = fields;
        this.name = "dataRow";
        this.fieldCount = fields.length;
      }
    };
    exports2.DataRowMessage = DataRowMessage;
    var NoticeMessage = class {
      constructor(length, message) {
        this.length = length;
        this.message = message;
        this.name = "notice";
      }
    };
    exports2.NoticeMessage = NoticeMessage;
  }
});

// node_modules/.pnpm/pg-protocol@1.11.0/node_modules/pg-protocol/dist/buffer-writer.js
var require_buffer_writer = __commonJS({
  "node_modules/.pnpm/pg-protocol@1.11.0/node_modules/pg-protocol/dist/buffer-writer.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Writer = void 0;
    var Writer = class {
      constructor(size = 256) {
        this.size = size;
        this.offset = 5;
        this.headerPosition = 0;
        this.buffer = Buffer.allocUnsafe(size);
      }
      ensure(size) {
        const remaining = this.buffer.length - this.offset;
        if (remaining < size) {
          const oldBuffer = this.buffer;
          const newSize = oldBuffer.length + (oldBuffer.length >> 1) + size;
          this.buffer = Buffer.allocUnsafe(newSize);
          oldBuffer.copy(this.buffer);
        }
      }
      addInt32(num) {
        this.ensure(4);
        this.buffer[this.offset++] = num >>> 24 & 255;
        this.buffer[this.offset++] = num >>> 16 & 255;
        this.buffer[this.offset++] = num >>> 8 & 255;
        this.buffer[this.offset++] = num >>> 0 & 255;
        return this;
      }
      addInt16(num) {
        this.ensure(2);
        this.buffer[this.offset++] = num >>> 8 & 255;
        this.buffer[this.offset++] = num >>> 0 & 255;
        return this;
      }
      addCString(string) {
        if (!string) {
          this.ensure(1);
        } else {
          const len = Buffer.byteLength(string);
          this.ensure(len + 1);
          this.buffer.write(string, this.offset, "utf-8");
          this.offset += len;
        }
        this.buffer[this.offset++] = 0;
        return this;
      }
      addString(string = "") {
        const len = Buffer.byteLength(string);
        this.ensure(len);
        this.buffer.write(string, this.offset);
        this.offset += len;
        return this;
      }
      add(otherBuffer) {
        this.ensure(otherBuffer.length);
        otherBuffer.copy(this.buffer, this.offset);
        this.offset += otherBuffer.length;
        return this;
      }
      join(code) {
        if (code) {
          this.buffer[this.headerPosition] = code;
          const length = this.offset - (this.headerPosition + 1);
          this.buffer.writeInt32BE(length, this.headerPosition + 1);
        }
        return this.buffer.slice(code ? 0 : 5, this.offset);
      }
      flush(code) {
        const result = this.join(code);
        this.offset = 5;
        this.headerPosition = 0;
        this.buffer = Buffer.allocUnsafe(this.size);
        return result;
      }
    };
    exports2.Writer = Writer;
  }
});

// node_modules/.pnpm/pg-protocol@1.11.0/node_modules/pg-protocol/dist/serializer.js
var require_serializer = __commonJS({
  "node_modules/.pnpm/pg-protocol@1.11.0/node_modules/pg-protocol/dist/serializer.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.serialize = void 0;
    var buffer_writer_1 = require_buffer_writer();
    var writer = new buffer_writer_1.Writer();
    var startup = (opts) => {
      writer.addInt16(3).addInt16(0);
      for (const key of Object.keys(opts)) {
        writer.addCString(key).addCString(opts[key]);
      }
      writer.addCString("client_encoding").addCString("UTF8");
      const bodyBuffer = writer.addCString("").flush();
      const length = bodyBuffer.length + 4;
      return new buffer_writer_1.Writer().addInt32(length).add(bodyBuffer).flush();
    };
    var requestSsl = () => {
      const response = Buffer.allocUnsafe(8);
      response.writeInt32BE(8, 0);
      response.writeInt32BE(80877103, 4);
      return response;
    };
    var password = (password2) => {
      return writer.addCString(password2).flush(
        112
        /* code.startup */
      );
    };
    var sendSASLInitialResponseMessage = function(mechanism, initialResponse) {
      writer.addCString(mechanism).addInt32(Buffer.byteLength(initialResponse)).addString(initialResponse);
      return writer.flush(
        112
        /* code.startup */
      );
    };
    var sendSCRAMClientFinalMessage = function(additionalData) {
      return writer.addString(additionalData).flush(
        112
        /* code.startup */
      );
    };
    var query = (text) => {
      return writer.addCString(text).flush(
        81
        /* code.query */
      );
    };
    var emptyArray = [];
    var parse = (query2) => {
      const name = query2.name || "";
      if (name.length > 63) {
        console.error("Warning! Postgres only supports 63 characters for query names.");
        console.error("You supplied %s (%s)", name, name.length);
        console.error("This can cause conflicts and silent errors executing queries");
      }
      const types = query2.types || emptyArray;
      const len = types.length;
      const buffer = writer.addCString(name).addCString(query2.text).addInt16(len);
      for (let i = 0; i < len; i++) {
        buffer.addInt32(types[i]);
      }
      return writer.flush(
        80
        /* code.parse */
      );
    };
    var paramWriter = new buffer_writer_1.Writer();
    var writeValues = function(values, valueMapper) {
      for (let i = 0; i < values.length; i++) {
        const mappedVal = valueMapper ? valueMapper(values[i], i) : values[i];
        if (mappedVal == null) {
          writer.addInt16(
            0
            /* ParamType.STRING */
          );
          paramWriter.addInt32(-1);
        } else if (mappedVal instanceof Buffer) {
          writer.addInt16(
            1
            /* ParamType.BINARY */
          );
          paramWriter.addInt32(mappedVal.length);
          paramWriter.add(mappedVal);
        } else {
          writer.addInt16(
            0
            /* ParamType.STRING */
          );
          paramWriter.addInt32(Buffer.byteLength(mappedVal));
          paramWriter.addString(mappedVal);
        }
      }
    };
    var bind = (config = {}) => {
      const portal = config.portal || "";
      const statement = config.statement || "";
      const binary = config.binary || false;
      const values = config.values || emptyArray;
      const len = values.length;
      writer.addCString(portal).addCString(statement);
      writer.addInt16(len);
      writeValues(values, config.valueMapper);
      writer.addInt16(len);
      writer.add(paramWriter.flush());
      writer.addInt16(1);
      writer.addInt16(
        binary ? 1 : 0
        /* ParamType.STRING */
      );
      return writer.flush(
        66
        /* code.bind */
      );
    };
    var emptyExecute = Buffer.from([69, 0, 0, 0, 9, 0, 0, 0, 0, 0]);
    var execute = (config) => {
      if (!config || !config.portal && !config.rows) {
        return emptyExecute;
      }
      const portal = config.portal || "";
      const rows = config.rows || 0;
      const portalLength = Buffer.byteLength(portal);
      const len = 4 + portalLength + 1 + 4;
      const buff = Buffer.allocUnsafe(1 + len);
      buff[0] = 69;
      buff.writeInt32BE(len, 1);
      buff.write(portal, 5, "utf-8");
      buff[portalLength + 5] = 0;
      buff.writeUInt32BE(rows, buff.length - 4);
      return buff;
    };
    var cancel = (processID, secretKey) => {
      const buffer = Buffer.allocUnsafe(16);
      buffer.writeInt32BE(16, 0);
      buffer.writeInt16BE(1234, 4);
      buffer.writeInt16BE(5678, 6);
      buffer.writeInt32BE(processID, 8);
      buffer.writeInt32BE(secretKey, 12);
      return buffer;
    };
    var cstringMessage = (code, string) => {
      const stringLen = Buffer.byteLength(string);
      const len = 4 + stringLen + 1;
      const buffer = Buffer.allocUnsafe(1 + len);
      buffer[0] = code;
      buffer.writeInt32BE(len, 1);
      buffer.write(string, 5, "utf-8");
      buffer[len] = 0;
      return buffer;
    };
    var emptyDescribePortal = writer.addCString("P").flush(
      68
      /* code.describe */
    );
    var emptyDescribeStatement = writer.addCString("S").flush(
      68
      /* code.describe */
    );
    var describe = (msg) => {
      return msg.name ? cstringMessage(68, `${msg.type}${msg.name || ""}`) : msg.type === "P" ? emptyDescribePortal : emptyDescribeStatement;
    };
    var close = (msg) => {
      const text = `${msg.type}${msg.name || ""}`;
      return cstringMessage(67, text);
    };
    var copyData = (chunk) => {
      return writer.add(chunk).flush(
        100
        /* code.copyFromChunk */
      );
    };
    var copyFail = (message) => {
      return cstringMessage(102, message);
    };
    var codeOnlyBuffer = (code) => Buffer.from([code, 0, 0, 0, 4]);
    var flushBuffer = codeOnlyBuffer(
      72
      /* code.flush */
    );
    var syncBuffer = codeOnlyBuffer(
      83
      /* code.sync */
    );
    var endBuffer = codeOnlyBuffer(
      88
      /* code.end */
    );
    var copyDoneBuffer = codeOnlyBuffer(
      99
      /* code.copyDone */
    );
    var serialize = {
      startup,
      password,
      requestSsl,
      sendSASLInitialResponseMessage,
      sendSCRAMClientFinalMessage,
      query,
      parse,
      bind,
      execute,
      describe,
      close,
      flush: () => flushBuffer,
      sync: () => syncBuffer,
      end: () => endBuffer,
      copyData,
      copyDone: () => copyDoneBuffer,
      copyFail,
      cancel
    };
    exports2.serialize = serialize;
  }
});

// node_modules/.pnpm/pg-protocol@1.11.0/node_modules/pg-protocol/dist/buffer-reader.js
var require_buffer_reader = __commonJS({
  "node_modules/.pnpm/pg-protocol@1.11.0/node_modules/pg-protocol/dist/buffer-reader.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.BufferReader = void 0;
    var emptyBuffer = Buffer.allocUnsafe(0);
    var BufferReader = class {
      constructor(offset = 0) {
        this.offset = offset;
        this.buffer = emptyBuffer;
        this.encoding = "utf-8";
      }
      setBuffer(offset, buffer) {
        this.offset = offset;
        this.buffer = buffer;
      }
      int16() {
        const result = this.buffer.readInt16BE(this.offset);
        this.offset += 2;
        return result;
      }
      byte() {
        const result = this.buffer[this.offset];
        this.offset++;
        return result;
      }
      int32() {
        const result = this.buffer.readInt32BE(this.offset);
        this.offset += 4;
        return result;
      }
      uint32() {
        const result = this.buffer.readUInt32BE(this.offset);
        this.offset += 4;
        return result;
      }
      string(length) {
        const result = this.buffer.toString(this.encoding, this.offset, this.offset + length);
        this.offset += length;
        return result;
      }
      cstring() {
        const start = this.offset;
        let end = start;
        while (this.buffer[end++] !== 0) {
        }
        this.offset = end;
        return this.buffer.toString(this.encoding, start, end - 1);
      }
      bytes(length) {
        const result = this.buffer.slice(this.offset, this.offset + length);
        this.offset += length;
        return result;
      }
    };
    exports2.BufferReader = BufferReader;
  }
});

// node_modules/.pnpm/pg-protocol@1.11.0/node_modules/pg-protocol/dist/parser.js
var require_parser = __commonJS({
  "node_modules/.pnpm/pg-protocol@1.11.0/node_modules/pg-protocol/dist/parser.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Parser = void 0;
    var messages_1 = require_messages();
    var buffer_reader_1 = require_buffer_reader();
    var CODE_LENGTH = 1;
    var LEN_LENGTH = 4;
    var HEADER_LENGTH = CODE_LENGTH + LEN_LENGTH;
    var LATEINIT_LENGTH = -1;
    var emptyBuffer = Buffer.allocUnsafe(0);
    var Parser = class {
      constructor(opts) {
        this.buffer = emptyBuffer;
        this.bufferLength = 0;
        this.bufferOffset = 0;
        this.reader = new buffer_reader_1.BufferReader();
        if ((opts === null || opts === void 0 ? void 0 : opts.mode) === "binary") {
          throw new Error("Binary mode not supported yet");
        }
        this.mode = (opts === null || opts === void 0 ? void 0 : opts.mode) || "text";
      }
      parse(buffer, callback) {
        this.mergeBuffer(buffer);
        const bufferFullLength = this.bufferOffset + this.bufferLength;
        let offset = this.bufferOffset;
        while (offset + HEADER_LENGTH <= bufferFullLength) {
          const code = this.buffer[offset];
          const length = this.buffer.readUInt32BE(offset + CODE_LENGTH);
          const fullMessageLength = CODE_LENGTH + length;
          if (fullMessageLength + offset <= bufferFullLength) {
            const message = this.handlePacket(offset + HEADER_LENGTH, code, length, this.buffer);
            callback(message);
            offset += fullMessageLength;
          } else {
            break;
          }
        }
        if (offset === bufferFullLength) {
          this.buffer = emptyBuffer;
          this.bufferLength = 0;
          this.bufferOffset = 0;
        } else {
          this.bufferLength = bufferFullLength - offset;
          this.bufferOffset = offset;
        }
      }
      mergeBuffer(buffer) {
        if (this.bufferLength > 0) {
          const newLength = this.bufferLength + buffer.byteLength;
          const newFullLength = newLength + this.bufferOffset;
          if (newFullLength > this.buffer.byteLength) {
            let newBuffer;
            if (newLength <= this.buffer.byteLength && this.bufferOffset >= this.bufferLength) {
              newBuffer = this.buffer;
            } else {
              let newBufferLength = this.buffer.byteLength * 2;
              while (newLength >= newBufferLength) {
                newBufferLength *= 2;
              }
              newBuffer = Buffer.allocUnsafe(newBufferLength);
            }
            this.buffer.copy(newBuffer, 0, this.bufferOffset, this.bufferOffset + this.bufferLength);
            this.buffer = newBuffer;
            this.bufferOffset = 0;
          }
          buffer.copy(this.buffer, this.bufferOffset + this.bufferLength);
          this.bufferLength = newLength;
        } else {
          this.buffer = buffer;
          this.bufferOffset = 0;
          this.bufferLength = buffer.byteLength;
        }
      }
      handlePacket(offset, code, length, bytes) {
        const { reader } = this;
        reader.setBuffer(offset, bytes);
        let message;
        switch (code) {
          case 50:
            message = messages_1.bindComplete;
            break;
          case 49:
            message = messages_1.parseComplete;
            break;
          case 51:
            message = messages_1.closeComplete;
            break;
          case 110:
            message = messages_1.noData;
            break;
          case 115:
            message = messages_1.portalSuspended;
            break;
          case 99:
            message = messages_1.copyDone;
            break;
          case 87:
            message = messages_1.replicationStart;
            break;
          case 73:
            message = messages_1.emptyQuery;
            break;
          case 68:
            message = parseDataRowMessage(reader);
            break;
          case 67:
            message = parseCommandCompleteMessage(reader);
            break;
          case 90:
            message = parseReadyForQueryMessage(reader);
            break;
          case 65:
            message = parseNotificationMessage(reader);
            break;
          case 82:
            message = parseAuthenticationResponse(reader, length);
            break;
          case 83:
            message = parseParameterStatusMessage(reader);
            break;
          case 75:
            message = parseBackendKeyData(reader);
            break;
          case 69:
            message = parseErrorMessage(reader, "error");
            break;
          case 78:
            message = parseErrorMessage(reader, "notice");
            break;
          case 84:
            message = parseRowDescriptionMessage(reader);
            break;
          case 116:
            message = parseParameterDescriptionMessage(reader);
            break;
          case 71:
            message = parseCopyInMessage(reader);
            break;
          case 72:
            message = parseCopyOutMessage(reader);
            break;
          case 100:
            message = parseCopyData(reader, length);
            break;
          default:
            return new messages_1.DatabaseError("received invalid response: " + code.toString(16), length, "error");
        }
        reader.setBuffer(0, emptyBuffer);
        message.length = length;
        return message;
      }
    };
    exports2.Parser = Parser;
    var parseReadyForQueryMessage = (reader) => {
      const status = reader.string(1);
      return new messages_1.ReadyForQueryMessage(LATEINIT_LENGTH, status);
    };
    var parseCommandCompleteMessage = (reader) => {
      const text = reader.cstring();
      return new messages_1.CommandCompleteMessage(LATEINIT_LENGTH, text);
    };
    var parseCopyData = (reader, length) => {
      const chunk = reader.bytes(length - 4);
      return new messages_1.CopyDataMessage(LATEINIT_LENGTH, chunk);
    };
    var parseCopyInMessage = (reader) => parseCopyMessage(reader, "copyInResponse");
    var parseCopyOutMessage = (reader) => parseCopyMessage(reader, "copyOutResponse");
    var parseCopyMessage = (reader, messageName) => {
      const isBinary = reader.byte() !== 0;
      const columnCount = reader.int16();
      const message = new messages_1.CopyResponse(LATEINIT_LENGTH, messageName, isBinary, columnCount);
      for (let i = 0; i < columnCount; i++) {
        message.columnTypes[i] = reader.int16();
      }
      return message;
    };
    var parseNotificationMessage = (reader) => {
      const processId = reader.int32();
      const channel = reader.cstring();
      const payload = reader.cstring();
      return new messages_1.NotificationResponseMessage(LATEINIT_LENGTH, processId, channel, payload);
    };
    var parseRowDescriptionMessage = (reader) => {
      const fieldCount = reader.int16();
      const message = new messages_1.RowDescriptionMessage(LATEINIT_LENGTH, fieldCount);
      for (let i = 0; i < fieldCount; i++) {
        message.fields[i] = parseField(reader);
      }
      return message;
    };
    var parseField = (reader) => {
      const name = reader.cstring();
      const tableID = reader.uint32();
      const columnID = reader.int16();
      const dataTypeID = reader.uint32();
      const dataTypeSize = reader.int16();
      const dataTypeModifier = reader.int32();
      const mode = reader.int16() === 0 ? "text" : "binary";
      return new messages_1.Field(name, tableID, columnID, dataTypeID, dataTypeSize, dataTypeModifier, mode);
    };
    var parseParameterDescriptionMessage = (reader) => {
      const parameterCount = reader.int16();
      const message = new messages_1.ParameterDescriptionMessage(LATEINIT_LENGTH, parameterCount);
      for (let i = 0; i < parameterCount; i++) {
        message.dataTypeIDs[i] = reader.int32();
      }
      return message;
    };
    var parseDataRowMessage = (reader) => {
      const fieldCount = reader.int16();
      const fields = new Array(fieldCount);
      for (let i = 0; i < fieldCount; i++) {
        const len = reader.int32();
        fields[i] = len === -1 ? null : reader.string(len);
      }
      return new messages_1.DataRowMessage(LATEINIT_LENGTH, fields);
    };
    var parseParameterStatusMessage = (reader) => {
      const name = reader.cstring();
      const value = reader.cstring();
      return new messages_1.ParameterStatusMessage(LATEINIT_LENGTH, name, value);
    };
    var parseBackendKeyData = (reader) => {
      const processID = reader.int32();
      const secretKey = reader.int32();
      return new messages_1.BackendKeyDataMessage(LATEINIT_LENGTH, processID, secretKey);
    };
    var parseAuthenticationResponse = (reader, length) => {
      const code = reader.int32();
      const message = {
        name: "authenticationOk",
        length
      };
      switch (code) {
        case 0:
          break;
        case 3:
          if (message.length === 8) {
            message.name = "authenticationCleartextPassword";
          }
          break;
        case 5:
          if (message.length === 12) {
            message.name = "authenticationMD5Password";
            const salt = reader.bytes(4);
            return new messages_1.AuthenticationMD5Password(LATEINIT_LENGTH, salt);
          }
          break;
        case 10:
          {
            message.name = "authenticationSASL";
            message.mechanisms = [];
            let mechanism;
            do {
              mechanism = reader.cstring();
              if (mechanism) {
                message.mechanisms.push(mechanism);
              }
            } while (mechanism);
          }
          break;
        case 11:
          message.name = "authenticationSASLContinue";
          message.data = reader.string(length - 8);
          break;
        case 12:
          message.name = "authenticationSASLFinal";
          message.data = reader.string(length - 8);
          break;
        default:
          throw new Error("Unknown authenticationOk message type " + code);
      }
      return message;
    };
    var parseErrorMessage = (reader, name) => {
      const fields = {};
      let fieldType = reader.string(1);
      while (fieldType !== "\0") {
        fields[fieldType] = reader.cstring();
        fieldType = reader.string(1);
      }
      const messageValue = fields.M;
      const message = name === "notice" ? new messages_1.NoticeMessage(LATEINIT_LENGTH, messageValue) : new messages_1.DatabaseError(messageValue, LATEINIT_LENGTH, name);
      message.severity = fields.S;
      message.code = fields.C;
      message.detail = fields.D;
      message.hint = fields.H;
      message.position = fields.P;
      message.internalPosition = fields.p;
      message.internalQuery = fields.q;
      message.where = fields.W;
      message.schema = fields.s;
      message.table = fields.t;
      message.column = fields.c;
      message.dataType = fields.d;
      message.constraint = fields.n;
      message.file = fields.F;
      message.line = fields.L;
      message.routine = fields.R;
      return message;
    };
  }
});

// node_modules/.pnpm/pg-protocol@1.11.0/node_modules/pg-protocol/dist/index.js
var require_dist = __commonJS({
  "node_modules/.pnpm/pg-protocol@1.11.0/node_modules/pg-protocol/dist/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DatabaseError = exports2.serialize = exports2.parse = void 0;
    var messages_1 = require_messages();
    Object.defineProperty(exports2, "DatabaseError", { enumerable: true, get: function() {
      return messages_1.DatabaseError;
    } });
    var serializer_1 = require_serializer();
    Object.defineProperty(exports2, "serialize", { enumerable: true, get: function() {
      return serializer_1.serialize;
    } });
    var parser_1 = require_parser();
    function parse(stream, callback) {
      const parser = new parser_1.Parser();
      stream.on("data", (buffer) => parser.parse(buffer, callback));
      return new Promise((resolve) => stream.on("end", () => resolve()));
    }
    exports2.parse = parse;
  }
});

// node_modules/.pnpm/pg-cloudflare@1.3.0/node_modules/pg-cloudflare/dist/empty.js
var require_empty = __commonJS({
  "node_modules/.pnpm/pg-cloudflare@1.3.0/node_modules/pg-cloudflare/dist/empty.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.default = {};
  }
});

// node_modules/.pnpm/pg@8.18.0/node_modules/pg/lib/stream.js
var require_stream = __commonJS({
  "node_modules/.pnpm/pg@8.18.0/node_modules/pg/lib/stream.js"(exports2, module2) {
    var { getStream, getSecureStream } = getStreamFuncs();
    module2.exports = {
      /**
       * Get a socket stream compatible with the current runtime environment.
       * @returns {Duplex}
       */
      getStream,
      /**
       * Get a TLS secured socket, compatible with the current environment,
       * using the socket and other settings given in `options`.
       * @returns {Duplex}
       */
      getSecureStream
    };
    function getNodejsStreamFuncs() {
      function getStream2(ssl) {
        const net2 = require("net");
        return new net2.Socket();
      }
      function getSecureStream2(options) {
        const tls = require("tls");
        return tls.connect(options);
      }
      return {
        getStream: getStream2,
        getSecureStream: getSecureStream2
      };
    }
    function getCloudflareStreamFuncs() {
      function getStream2(ssl) {
        const { CloudflareSocket } = require_empty();
        return new CloudflareSocket(ssl);
      }
      function getSecureStream2(options) {
        options.socket.startTls(options);
        return options.socket;
      }
      return {
        getStream: getStream2,
        getSecureStream: getSecureStream2
      };
    }
    function isCloudflareRuntime() {
      if (typeof navigator === "object" && navigator !== null && typeof navigator.userAgent === "string") {
        return navigator.userAgent === "Cloudflare-Workers";
      }
      if (typeof Response === "function") {
        const resp = new Response(null, { cf: { thing: true } });
        if (typeof resp.cf === "object" && resp.cf !== null && resp.cf.thing) {
          return true;
        }
      }
      return false;
    }
    function getStreamFuncs() {
      if (isCloudflareRuntime()) {
        return getCloudflareStreamFuncs();
      }
      return getNodejsStreamFuncs();
    }
  }
});

// node_modules/.pnpm/pg@8.18.0/node_modules/pg/lib/connection.js
var require_connection = __commonJS({
  "node_modules/.pnpm/pg@8.18.0/node_modules/pg/lib/connection.js"(exports2, module2) {
    "use strict";
    var EventEmitter = require("events").EventEmitter;
    var { parse, serialize } = require_dist();
    var { getStream, getSecureStream } = require_stream();
    var flushBuffer = serialize.flush();
    var syncBuffer = serialize.sync();
    var endBuffer = serialize.end();
    var Connection = class extends EventEmitter {
      constructor(config) {
        super();
        config = config || {};
        this.stream = config.stream || getStream(config.ssl);
        if (typeof this.stream === "function") {
          this.stream = this.stream(config);
        }
        this._keepAlive = config.keepAlive;
        this._keepAliveInitialDelayMillis = config.keepAliveInitialDelayMillis;
        this.parsedStatements = {};
        this.ssl = config.ssl || false;
        this._ending = false;
        this._emitMessage = false;
        const self = this;
        this.on("newListener", function(eventName) {
          if (eventName === "message") {
            self._emitMessage = true;
          }
        });
      }
      connect(port, host) {
        const self = this;
        this._connecting = true;
        this.stream.setNoDelay(true);
        this.stream.connect(port, host);
        this.stream.once("connect", function() {
          if (self._keepAlive) {
            self.stream.setKeepAlive(true, self._keepAliveInitialDelayMillis);
          }
          self.emit("connect");
        });
        const reportStreamError = function(error) {
          if (self._ending && (error.code === "ECONNRESET" || error.code === "EPIPE")) {
            return;
          }
          self.emit("error", error);
        };
        this.stream.on("error", reportStreamError);
        this.stream.on("close", function() {
          self.emit("end");
        });
        if (!this.ssl) {
          return this.attachListeners(this.stream);
        }
        this.stream.once("data", function(buffer) {
          const responseCode = buffer.toString("utf8");
          switch (responseCode) {
            case "S":
              break;
            case "N":
              self.stream.end();
              return self.emit("error", new Error("The server does not support SSL connections"));
            default:
              self.stream.end();
              return self.emit("error", new Error("There was an error establishing an SSL connection"));
          }
          const options = {
            socket: self.stream
          };
          if (self.ssl !== true) {
            Object.assign(options, self.ssl);
            if ("key" in self.ssl) {
              options.key = self.ssl.key;
            }
          }
          const net2 = require("net");
          if (net2.isIP && net2.isIP(host) === 0) {
            options.servername = host;
          }
          try {
            self.stream = getSecureStream(options);
          } catch (err) {
            return self.emit("error", err);
          }
          self.attachListeners(self.stream);
          self.stream.on("error", reportStreamError);
          self.emit("sslconnect");
        });
      }
      attachListeners(stream) {
        parse(stream, (msg) => {
          const eventName = msg.name === "error" ? "errorMessage" : msg.name;
          if (this._emitMessage) {
            this.emit("message", msg);
          }
          this.emit(eventName, msg);
        });
      }
      requestSsl() {
        this.stream.write(serialize.requestSsl());
      }
      startup(config) {
        this.stream.write(serialize.startup(config));
      }
      cancel(processID, secretKey) {
        this._send(serialize.cancel(processID, secretKey));
      }
      password(password) {
        this._send(serialize.password(password));
      }
      sendSASLInitialResponseMessage(mechanism, initialResponse) {
        this._send(serialize.sendSASLInitialResponseMessage(mechanism, initialResponse));
      }
      sendSCRAMClientFinalMessage(additionalData) {
        this._send(serialize.sendSCRAMClientFinalMessage(additionalData));
      }
      _send(buffer) {
        if (!this.stream.writable) {
          return false;
        }
        return this.stream.write(buffer);
      }
      query(text) {
        this._send(serialize.query(text));
      }
      // send parse message
      parse(query) {
        this._send(serialize.parse(query));
      }
      // send bind message
      bind(config) {
        this._send(serialize.bind(config));
      }
      // send execute message
      execute(config) {
        this._send(serialize.execute(config));
      }
      flush() {
        if (this.stream.writable) {
          this.stream.write(flushBuffer);
        }
      }
      sync() {
        this._ending = true;
        this._send(syncBuffer);
      }
      ref() {
        this.stream.ref();
      }
      unref() {
        this.stream.unref();
      }
      end() {
        this._ending = true;
        if (!this._connecting || !this.stream.writable) {
          this.stream.end();
          return;
        }
        return this.stream.write(endBuffer, () => {
          this.stream.end();
        });
      }
      close(msg) {
        this._send(serialize.close(msg));
      }
      describe(msg) {
        this._send(serialize.describe(msg));
      }
      sendCopyFromChunk(chunk) {
        this._send(serialize.copyData(chunk));
      }
      endCopyFrom() {
        this._send(serialize.copyDone());
      }
      sendCopyFail(msg) {
        this._send(serialize.copyFail(msg));
      }
    };
    module2.exports = Connection;
  }
});

// node_modules/.pnpm/split2@4.2.0/node_modules/split2/index.js
var require_split2 = __commonJS({
  "node_modules/.pnpm/split2@4.2.0/node_modules/split2/index.js"(exports2, module2) {
    "use strict";
    var { Transform } = require("stream");
    var { StringDecoder } = require("string_decoder");
    var kLast = Symbol("last");
    var kDecoder = Symbol("decoder");
    function transform(chunk, enc, cb) {
      let list;
      if (this.overflow) {
        const buf = this[kDecoder].write(chunk);
        list = buf.split(this.matcher);
        if (list.length === 1) return cb();
        list.shift();
        this.overflow = false;
      } else {
        this[kLast] += this[kDecoder].write(chunk);
        list = this[kLast].split(this.matcher);
      }
      this[kLast] = list.pop();
      for (let i = 0; i < list.length; i++) {
        try {
          push(this, this.mapper(list[i]));
        } catch (error) {
          return cb(error);
        }
      }
      this.overflow = this[kLast].length > this.maxLength;
      if (this.overflow && !this.skipOverflow) {
        cb(new Error("maximum buffer reached"));
        return;
      }
      cb();
    }
    function flush(cb) {
      this[kLast] += this[kDecoder].end();
      if (this[kLast]) {
        try {
          push(this, this.mapper(this[kLast]));
        } catch (error) {
          return cb(error);
        }
      }
      cb();
    }
    function push(self, val) {
      if (val !== void 0) {
        self.push(val);
      }
    }
    function noop(incoming) {
      return incoming;
    }
    function split(matcher, mapper, options) {
      matcher = matcher || /\r?\n/;
      mapper = mapper || noop;
      options = options || {};
      switch (arguments.length) {
        case 1:
          if (typeof matcher === "function") {
            mapper = matcher;
            matcher = /\r?\n/;
          } else if (typeof matcher === "object" && !(matcher instanceof RegExp) && !matcher[Symbol.split]) {
            options = matcher;
            matcher = /\r?\n/;
          }
          break;
        case 2:
          if (typeof matcher === "function") {
            options = mapper;
            mapper = matcher;
            matcher = /\r?\n/;
          } else if (typeof mapper === "object") {
            options = mapper;
            mapper = noop;
          }
      }
      options = Object.assign({}, options);
      options.autoDestroy = true;
      options.transform = transform;
      options.flush = flush;
      options.readableObjectMode = true;
      const stream = new Transform(options);
      stream[kLast] = "";
      stream[kDecoder] = new StringDecoder("utf8");
      stream.matcher = matcher;
      stream.mapper = mapper;
      stream.maxLength = options.maxLength;
      stream.skipOverflow = options.skipOverflow || false;
      stream.overflow = false;
      stream._destroy = function(err, cb) {
        this._writableState.errorEmitted = false;
        cb(err);
      };
      return stream;
    }
    module2.exports = split;
  }
});

// node_modules/.pnpm/pgpass@1.0.5/node_modules/pgpass/lib/helper.js
var require_helper = __commonJS({
  "node_modules/.pnpm/pgpass@1.0.5/node_modules/pgpass/lib/helper.js"(exports2, module2) {
    "use strict";
    var path2 = require("path");
    var Stream = require("stream").Stream;
    var split = require_split2();
    var util = require("util");
    var defaultPort = 5432;
    var isWin = process.platform === "win32";
    var warnStream = process.stderr;
    var S_IRWXG = 56;
    var S_IRWXO = 7;
    var S_IFMT = 61440;
    var S_IFREG = 32768;
    function isRegFile(mode) {
      return (mode & S_IFMT) == S_IFREG;
    }
    var fieldNames = ["host", "port", "database", "user", "password"];
    var nrOfFields = fieldNames.length;
    var passKey = fieldNames[nrOfFields - 1];
    function warn() {
      var isWritable = warnStream instanceof Stream && true === warnStream.writable;
      if (isWritable) {
        var args = Array.prototype.slice.call(arguments).concat("\n");
        warnStream.write(util.format.apply(util, args));
      }
    }
    Object.defineProperty(module2.exports, "isWin", {
      get: function() {
        return isWin;
      },
      set: function(val) {
        isWin = val;
      }
    });
    module2.exports.warnTo = function(stream) {
      var old = warnStream;
      warnStream = stream;
      return old;
    };
    module2.exports.getFileName = function(rawEnv) {
      var env = rawEnv || process.env;
      var file = env.PGPASSFILE || (isWin ? path2.join(env.APPDATA || "./", "postgresql", "pgpass.conf") : path2.join(env.HOME || "./", ".pgpass"));
      return file;
    };
    module2.exports.usePgPass = function(stats, fname) {
      if (Object.prototype.hasOwnProperty.call(process.env, "PGPASSWORD")) {
        return false;
      }
      if (isWin) {
        return true;
      }
      fname = fname || "<unkn>";
      if (!isRegFile(stats.mode)) {
        warn('WARNING: password file "%s" is not a plain file', fname);
        return false;
      }
      if (stats.mode & (S_IRWXG | S_IRWXO)) {
        warn('WARNING: password file "%s" has group or world access; permissions should be u=rw (0600) or less', fname);
        return false;
      }
      return true;
    };
    var matcher = module2.exports.match = function(connInfo, entry) {
      return fieldNames.slice(0, -1).reduce(function(prev, field, idx) {
        if (idx == 1) {
          if (Number(connInfo[field] || defaultPort) === Number(entry[field])) {
            return prev && true;
          }
        }
        return prev && (entry[field] === "*" || entry[field] === connInfo[field]);
      }, true);
    };
    module2.exports.getPassword = function(connInfo, stream, cb) {
      var pass;
      var lineStream = stream.pipe(split());
      function onLine(line) {
        var entry = parseLine(line);
        if (entry && isValidEntry(entry) && matcher(connInfo, entry)) {
          pass = entry[passKey];
          lineStream.end();
        }
      }
      var onEnd = function() {
        stream.destroy();
        cb(pass);
      };
      var onErr = function(err) {
        stream.destroy();
        warn("WARNING: error on reading file: %s", err);
        cb(void 0);
      };
      stream.on("error", onErr);
      lineStream.on("data", onLine).on("end", onEnd).on("error", onErr);
    };
    var parseLine = module2.exports.parseLine = function(line) {
      if (line.length < 11 || line.match(/^\s+#/)) {
        return null;
      }
      var curChar = "";
      var prevChar = "";
      var fieldIdx = 0;
      var startIdx = 0;
      var endIdx = 0;
      var obj = {};
      var isLastField = false;
      var addToObj = function(idx, i0, i1) {
        var field = line.substring(i0, i1);
        if (!Object.hasOwnProperty.call(process.env, "PGPASS_NO_DEESCAPE")) {
          field = field.replace(/\\([:\\])/g, "$1");
        }
        obj[fieldNames[idx]] = field;
      };
      for (var i = 0; i < line.length - 1; i += 1) {
        curChar = line.charAt(i + 1);
        prevChar = line.charAt(i);
        isLastField = fieldIdx == nrOfFields - 1;
        if (isLastField) {
          addToObj(fieldIdx, startIdx);
          break;
        }
        if (i >= 0 && curChar == ":" && prevChar !== "\\") {
          addToObj(fieldIdx, startIdx, i + 1);
          startIdx = i + 2;
          fieldIdx += 1;
        }
      }
      obj = Object.keys(obj).length === nrOfFields ? obj : null;
      return obj;
    };
    var isValidEntry = module2.exports.isValidEntry = function(entry) {
      var rules = {
        // host
        0: function(x) {
          return x.length > 0;
        },
        // port
        1: function(x) {
          if (x === "*") {
            return true;
          }
          x = Number(x);
          return isFinite(x) && x > 0 && x < 9007199254740992 && Math.floor(x) === x;
        },
        // database
        2: function(x) {
          return x.length > 0;
        },
        // username
        3: function(x) {
          return x.length > 0;
        },
        // password
        4: function(x) {
          return x.length > 0;
        }
      };
      for (var idx = 0; idx < fieldNames.length; idx += 1) {
        var rule = rules[idx];
        var value = entry[fieldNames[idx]] || "";
        var res = rule(value);
        if (!res) {
          return false;
        }
      }
      return true;
    };
  }
});

// node_modules/.pnpm/pgpass@1.0.5/node_modules/pgpass/lib/index.js
var require_lib = __commonJS({
  "node_modules/.pnpm/pgpass@1.0.5/node_modules/pgpass/lib/index.js"(exports2, module2) {
    "use strict";
    var path2 = require("path");
    var fs2 = require("fs");
    var helper = require_helper();
    module2.exports = function(connInfo, cb) {
      var file = helper.getFileName();
      fs2.stat(file, function(err, stat) {
        if (err || !helper.usePgPass(stat, file)) {
          return cb(void 0);
        }
        var st = fs2.createReadStream(file);
        helper.getPassword(connInfo, st, cb);
      });
    };
    module2.exports.warnTo = helper.warnTo;
  }
});

// node_modules/.pnpm/pg@8.18.0/node_modules/pg/lib/client.js
var require_client = __commonJS({
  "node_modules/.pnpm/pg@8.18.0/node_modules/pg/lib/client.js"(exports2, module2) {
    "use strict";
    var EventEmitter = require("events").EventEmitter;
    var utils = require_utils();
    var nodeUtils = require("util");
    var sasl = require_sasl();
    var TypeOverrides = require_type_overrides();
    var ConnectionParameters = require_connection_parameters();
    var Query = require_query();
    var defaults = require_defaults();
    var Connection = require_connection();
    var crypto = require_utils2();
    var activeQueryDeprecationNotice = nodeUtils.deprecate(
      () => {
      },
      "Client.activeQuery is deprecated and will be removed in a future version."
    );
    var queryQueueDeprecationNotice = nodeUtils.deprecate(
      () => {
      },
      "Client.queryQueue is deprecated and will be removed in a future version."
    );
    var pgPassDeprecationNotice = nodeUtils.deprecate(
      () => {
      },
      "pgpass support is deprecated and will be removed in a future version. You can provide an async function as the password property to the Client/Pool constructor that returns a password instead. Within this funciton you can call the pgpass module in your own code."
    );
    var byoPromiseDeprecationNotice = nodeUtils.deprecate(
      () => {
      },
      "Passing a custom Promise implementation to the Client/Pool constructor is deprecated and will be removed in a future version."
    );
    var Client = class extends EventEmitter {
      constructor(config) {
        super();
        this.connectionParameters = new ConnectionParameters(config);
        this.user = this.connectionParameters.user;
        this.database = this.connectionParameters.database;
        this.port = this.connectionParameters.port;
        this.host = this.connectionParameters.host;
        Object.defineProperty(this, "password", {
          configurable: true,
          enumerable: false,
          writable: true,
          value: this.connectionParameters.password
        });
        this.replication = this.connectionParameters.replication;
        const c = config || {};
        if (c.Promise) {
          byoPromiseDeprecationNotice();
        }
        this._Promise = c.Promise || global.Promise;
        this._types = new TypeOverrides(c.types);
        this._ending = false;
        this._ended = false;
        this._connecting = false;
        this._connected = false;
        this._connectionError = false;
        this._queryable = true;
        this._activeQuery = null;
        this.enableChannelBinding = Boolean(c.enableChannelBinding);
        this.connection = c.connection || new Connection({
          stream: c.stream,
          ssl: this.connectionParameters.ssl,
          keepAlive: c.keepAlive || false,
          keepAliveInitialDelayMillis: c.keepAliveInitialDelayMillis || 0,
          encoding: this.connectionParameters.client_encoding || "utf8"
        });
        this._queryQueue = [];
        this.binary = c.binary || defaults.binary;
        this.processID = null;
        this.secretKey = null;
        this.ssl = this.connectionParameters.ssl || false;
        if (this.ssl && this.ssl.key) {
          Object.defineProperty(this.ssl, "key", {
            enumerable: false
          });
        }
        this._connectionTimeoutMillis = c.connectionTimeoutMillis || 0;
      }
      get activeQuery() {
        activeQueryDeprecationNotice();
        return this._activeQuery;
      }
      set activeQuery(val) {
        activeQueryDeprecationNotice();
        this._activeQuery = val;
      }
      _getActiveQuery() {
        return this._activeQuery;
      }
      _errorAllQueries(err) {
        const enqueueError = (query) => {
          process.nextTick(() => {
            query.handleError(err, this.connection);
          });
        };
        const activeQuery = this._getActiveQuery();
        if (activeQuery) {
          enqueueError(activeQuery);
          this._activeQuery = null;
        }
        this._queryQueue.forEach(enqueueError);
        this._queryQueue.length = 0;
      }
      _connect(callback) {
        const self = this;
        const con = this.connection;
        this._connectionCallback = callback;
        if (this._connecting || this._connected) {
          const err = new Error("Client has already been connected. You cannot reuse a client.");
          process.nextTick(() => {
            callback(err);
          });
          return;
        }
        this._connecting = true;
        if (this._connectionTimeoutMillis > 0) {
          this.connectionTimeoutHandle = setTimeout(() => {
            con._ending = true;
            con.stream.destroy(new Error("timeout expired"));
          }, this._connectionTimeoutMillis);
          if (this.connectionTimeoutHandle.unref) {
            this.connectionTimeoutHandle.unref();
          }
        }
        if (this.host && this.host.indexOf("/") === 0) {
          con.connect(this.host + "/.s.PGSQL." + this.port);
        } else {
          con.connect(this.port, this.host);
        }
        con.on("connect", function() {
          if (self.ssl) {
            con.requestSsl();
          } else {
            con.startup(self.getStartupConf());
          }
        });
        con.on("sslconnect", function() {
          con.startup(self.getStartupConf());
        });
        this._attachListeners(con);
        con.once("end", () => {
          const error = this._ending ? new Error("Connection terminated") : new Error("Connection terminated unexpectedly");
          clearTimeout(this.connectionTimeoutHandle);
          this._errorAllQueries(error);
          this._ended = true;
          if (!this._ending) {
            if (this._connecting && !this._connectionError) {
              if (this._connectionCallback) {
                this._connectionCallback(error);
              } else {
                this._handleErrorEvent(error);
              }
            } else if (!this._connectionError) {
              this._handleErrorEvent(error);
            }
          }
          process.nextTick(() => {
            this.emit("end");
          });
        });
      }
      connect(callback) {
        if (callback) {
          this._connect(callback);
          return;
        }
        return new this._Promise((resolve, reject) => {
          this._connect((error) => {
            if (error) {
              reject(error);
            } else {
              resolve(this);
            }
          });
        });
      }
      _attachListeners(con) {
        con.on("authenticationCleartextPassword", this._handleAuthCleartextPassword.bind(this));
        con.on("authenticationMD5Password", this._handleAuthMD5Password.bind(this));
        con.on("authenticationSASL", this._handleAuthSASL.bind(this));
        con.on("authenticationSASLContinue", this._handleAuthSASLContinue.bind(this));
        con.on("authenticationSASLFinal", this._handleAuthSASLFinal.bind(this));
        con.on("backendKeyData", this._handleBackendKeyData.bind(this));
        con.on("error", this._handleErrorEvent.bind(this));
        con.on("errorMessage", this._handleErrorMessage.bind(this));
        con.on("readyForQuery", this._handleReadyForQuery.bind(this));
        con.on("notice", this._handleNotice.bind(this));
        con.on("rowDescription", this._handleRowDescription.bind(this));
        con.on("dataRow", this._handleDataRow.bind(this));
        con.on("portalSuspended", this._handlePortalSuspended.bind(this));
        con.on("emptyQuery", this._handleEmptyQuery.bind(this));
        con.on("commandComplete", this._handleCommandComplete.bind(this));
        con.on("parseComplete", this._handleParseComplete.bind(this));
        con.on("copyInResponse", this._handleCopyInResponse.bind(this));
        con.on("copyData", this._handleCopyData.bind(this));
        con.on("notification", this._handleNotification.bind(this));
      }
      _getPassword(cb) {
        const con = this.connection;
        if (typeof this.password === "function") {
          this._Promise.resolve().then(() => this.password()).then((pass) => {
            if (pass !== void 0) {
              if (typeof pass !== "string") {
                con.emit("error", new TypeError("Password must be a string"));
                return;
              }
              this.connectionParameters.password = this.password = pass;
            } else {
              this.connectionParameters.password = this.password = null;
            }
            cb();
          }).catch((err) => {
            con.emit("error", err);
          });
        } else if (this.password !== null) {
          cb();
        } else {
          try {
            const pgPass = require_lib();
            pgPass(this.connectionParameters, (pass) => {
              if (void 0 !== pass) {
                pgPassDeprecationNotice();
                this.connectionParameters.password = this.password = pass;
              }
              cb();
            });
          } catch (e) {
            this.emit("error", e);
          }
        }
      }
      _handleAuthCleartextPassword(msg) {
        this._getPassword(() => {
          this.connection.password(this.password);
        });
      }
      _handleAuthMD5Password(msg) {
        this._getPassword(async () => {
          try {
            const hashedPassword = await crypto.postgresMd5PasswordHash(this.user, this.password, msg.salt);
            this.connection.password(hashedPassword);
          } catch (e) {
            this.emit("error", e);
          }
        });
      }
      _handleAuthSASL(msg) {
        this._getPassword(() => {
          try {
            this.saslSession = sasl.startSession(msg.mechanisms, this.enableChannelBinding && this.connection.stream);
            this.connection.sendSASLInitialResponseMessage(this.saslSession.mechanism, this.saslSession.response);
          } catch (err) {
            this.connection.emit("error", err);
          }
        });
      }
      async _handleAuthSASLContinue(msg) {
        try {
          await sasl.continueSession(
            this.saslSession,
            this.password,
            msg.data,
            this.enableChannelBinding && this.connection.stream
          );
          this.connection.sendSCRAMClientFinalMessage(this.saslSession.response);
        } catch (err) {
          this.connection.emit("error", err);
        }
      }
      _handleAuthSASLFinal(msg) {
        try {
          sasl.finalizeSession(this.saslSession, msg.data);
          this.saslSession = null;
        } catch (err) {
          this.connection.emit("error", err);
        }
      }
      _handleBackendKeyData(msg) {
        this.processID = msg.processID;
        this.secretKey = msg.secretKey;
      }
      _handleReadyForQuery(msg) {
        if (this._connecting) {
          this._connecting = false;
          this._connected = true;
          clearTimeout(this.connectionTimeoutHandle);
          if (this._connectionCallback) {
            this._connectionCallback(null, this);
            this._connectionCallback = null;
          }
          this.emit("connect");
        }
        const activeQuery = this._getActiveQuery();
        this._activeQuery = null;
        this.readyForQuery = true;
        if (activeQuery) {
          activeQuery.handleReadyForQuery(this.connection);
        }
        this._pulseQueryQueue();
      }
      // if we receive an error event or error message
      // during the connection process we handle it here
      _handleErrorWhileConnecting(err) {
        if (this._connectionError) {
          return;
        }
        this._connectionError = true;
        clearTimeout(this.connectionTimeoutHandle);
        if (this._connectionCallback) {
          return this._connectionCallback(err);
        }
        this.emit("error", err);
      }
      // if we're connected and we receive an error event from the connection
      // this means the socket is dead - do a hard abort of all queries and emit
      // the socket error on the client as well
      _handleErrorEvent(err) {
        if (this._connecting) {
          return this._handleErrorWhileConnecting(err);
        }
        this._queryable = false;
        this._errorAllQueries(err);
        this.emit("error", err);
      }
      // handle error messages from the postgres backend
      _handleErrorMessage(msg) {
        if (this._connecting) {
          return this._handleErrorWhileConnecting(msg);
        }
        const activeQuery = this._getActiveQuery();
        if (!activeQuery) {
          this._handleErrorEvent(msg);
          return;
        }
        this._activeQuery = null;
        activeQuery.handleError(msg, this.connection);
      }
      _handleRowDescription(msg) {
        const activeQuery = this._getActiveQuery();
        if (activeQuery == null) {
          const error = new Error("Received unexpected rowDescription message from backend.");
          this._handleErrorEvent(error);
          return;
        }
        activeQuery.handleRowDescription(msg);
      }
      _handleDataRow(msg) {
        const activeQuery = this._getActiveQuery();
        if (activeQuery == null) {
          const error = new Error("Received unexpected dataRow message from backend.");
          this._handleErrorEvent(error);
          return;
        }
        activeQuery.handleDataRow(msg);
      }
      _handlePortalSuspended(msg) {
        const activeQuery = this._getActiveQuery();
        if (activeQuery == null) {
          const error = new Error("Received unexpected portalSuspended message from backend.");
          this._handleErrorEvent(error);
          return;
        }
        activeQuery.handlePortalSuspended(this.connection);
      }
      _handleEmptyQuery(msg) {
        const activeQuery = this._getActiveQuery();
        if (activeQuery == null) {
          const error = new Error("Received unexpected emptyQuery message from backend.");
          this._handleErrorEvent(error);
          return;
        }
        activeQuery.handleEmptyQuery(this.connection);
      }
      _handleCommandComplete(msg) {
        const activeQuery = this._getActiveQuery();
        if (activeQuery == null) {
          const error = new Error("Received unexpected commandComplete message from backend.");
          this._handleErrorEvent(error);
          return;
        }
        activeQuery.handleCommandComplete(msg, this.connection);
      }
      _handleParseComplete() {
        const activeQuery = this._getActiveQuery();
        if (activeQuery == null) {
          const error = new Error("Received unexpected parseComplete message from backend.");
          this._handleErrorEvent(error);
          return;
        }
        if (activeQuery.name) {
          this.connection.parsedStatements[activeQuery.name] = activeQuery.text;
        }
      }
      _handleCopyInResponse(msg) {
        const activeQuery = this._getActiveQuery();
        if (activeQuery == null) {
          const error = new Error("Received unexpected copyInResponse message from backend.");
          this._handleErrorEvent(error);
          return;
        }
        activeQuery.handleCopyInResponse(this.connection);
      }
      _handleCopyData(msg) {
        const activeQuery = this._getActiveQuery();
        if (activeQuery == null) {
          const error = new Error("Received unexpected copyData message from backend.");
          this._handleErrorEvent(error);
          return;
        }
        activeQuery.handleCopyData(msg, this.connection);
      }
      _handleNotification(msg) {
        this.emit("notification", msg);
      }
      _handleNotice(msg) {
        this.emit("notice", msg);
      }
      getStartupConf() {
        const params = this.connectionParameters;
        const data = {
          user: params.user,
          database: params.database
        };
        const appName = params.application_name || params.fallback_application_name;
        if (appName) {
          data.application_name = appName;
        }
        if (params.replication) {
          data.replication = "" + params.replication;
        }
        if (params.statement_timeout) {
          data.statement_timeout = String(parseInt(params.statement_timeout, 10));
        }
        if (params.lock_timeout) {
          data.lock_timeout = String(parseInt(params.lock_timeout, 10));
        }
        if (params.idle_in_transaction_session_timeout) {
          data.idle_in_transaction_session_timeout = String(parseInt(params.idle_in_transaction_session_timeout, 10));
        }
        if (params.options) {
          data.options = params.options;
        }
        return data;
      }
      cancel(client, query) {
        if (client.activeQuery === query) {
          const con = this.connection;
          if (this.host && this.host.indexOf("/") === 0) {
            con.connect(this.host + "/.s.PGSQL." + this.port);
          } else {
            con.connect(this.port, this.host);
          }
          con.on("connect", function() {
            con.cancel(client.processID, client.secretKey);
          });
        } else if (client._queryQueue.indexOf(query) !== -1) {
          client._queryQueue.splice(client._queryQueue.indexOf(query), 1);
        }
      }
      setTypeParser(oid, format, parseFn) {
        return this._types.setTypeParser(oid, format, parseFn);
      }
      getTypeParser(oid, format) {
        return this._types.getTypeParser(oid, format);
      }
      // escapeIdentifier and escapeLiteral moved to utility functions & exported
      // on PG
      // re-exported here for backwards compatibility
      escapeIdentifier(str) {
        return utils.escapeIdentifier(str);
      }
      escapeLiteral(str) {
        return utils.escapeLiteral(str);
      }
      _pulseQueryQueue() {
        if (this.readyForQuery === true) {
          this._activeQuery = this._queryQueue.shift();
          const activeQuery = this._getActiveQuery();
          if (activeQuery) {
            this.readyForQuery = false;
            this.hasExecuted = true;
            const queryError = activeQuery.submit(this.connection);
            if (queryError) {
              process.nextTick(() => {
                activeQuery.handleError(queryError, this.connection);
                this.readyForQuery = true;
                this._pulseQueryQueue();
              });
            }
          } else if (this.hasExecuted) {
            this._activeQuery = null;
            this.emit("drain");
          }
        }
      }
      query(config, values, callback) {
        let query;
        let result;
        let readTimeout;
        let readTimeoutTimer;
        let queryCallback;
        if (config === null || config === void 0) {
          throw new TypeError("Client was passed a null or undefined query");
        } else if (typeof config.submit === "function") {
          readTimeout = config.query_timeout || this.connectionParameters.query_timeout;
          result = query = config;
          if (typeof values === "function") {
            query.callback = query.callback || values;
          }
        } else {
          readTimeout = config.query_timeout || this.connectionParameters.query_timeout;
          query = new Query(config, values, callback);
          if (!query.callback) {
            result = new this._Promise((resolve, reject) => {
              query.callback = (err, res) => err ? reject(err) : resolve(res);
            }).catch((err) => {
              Error.captureStackTrace(err);
              throw err;
            });
          }
        }
        if (readTimeout) {
          queryCallback = query.callback;
          readTimeoutTimer = setTimeout(() => {
            const error = new Error("Query read timeout");
            process.nextTick(() => {
              query.handleError(error, this.connection);
            });
            queryCallback(error);
            query.callback = () => {
            };
            const index = this._queryQueue.indexOf(query);
            if (index > -1) {
              this._queryQueue.splice(index, 1);
            }
            this._pulseQueryQueue();
          }, readTimeout);
          query.callback = (err, res) => {
            clearTimeout(readTimeoutTimer);
            queryCallback(err, res);
          };
        }
        if (this.binary && !query.binary) {
          query.binary = true;
        }
        if (query._result && !query._result._types) {
          query._result._types = this._types;
        }
        if (!this._queryable) {
          process.nextTick(() => {
            query.handleError(new Error("Client has encountered a connection error and is not queryable"), this.connection);
          });
          return result;
        }
        if (this._ending) {
          process.nextTick(() => {
            query.handleError(new Error("Client was closed and is not queryable"), this.connection);
          });
          return result;
        }
        this._queryQueue.push(query);
        this._pulseQueryQueue();
        return result;
      }
      ref() {
        this.connection.ref();
      }
      unref() {
        this.connection.unref();
      }
      end(cb) {
        this._ending = true;
        if (!this.connection._connecting || this._ended) {
          if (cb) {
            cb();
          } else {
            return this._Promise.resolve();
          }
        }
        if (this._getActiveQuery() || !this._queryable) {
          this.connection.stream.destroy();
        } else {
          this.connection.end();
        }
        if (cb) {
          this.connection.once("end", cb);
        } else {
          return new this._Promise((resolve) => {
            this.connection.once("end", resolve);
          });
        }
      }
      get queryQueue() {
        queryQueueDeprecationNotice();
        return this._queryQueue;
      }
    };
    Client.Query = Query;
    module2.exports = Client;
  }
});

// node_modules/.pnpm/pg-pool@3.11.0_pg@8.18.0/node_modules/pg-pool/index.js
var require_pg_pool = __commonJS({
  "node_modules/.pnpm/pg-pool@3.11.0_pg@8.18.0/node_modules/pg-pool/index.js"(exports2, module2) {
    "use strict";
    var EventEmitter = require("events").EventEmitter;
    var NOOP = function() {
    };
    var removeWhere = (list, predicate) => {
      const i = list.findIndex(predicate);
      return i === -1 ? void 0 : list.splice(i, 1)[0];
    };
    var IdleItem = class {
      constructor(client, idleListener, timeoutId) {
        this.client = client;
        this.idleListener = idleListener;
        this.timeoutId = timeoutId;
      }
    };
    var PendingItem = class {
      constructor(callback) {
        this.callback = callback;
      }
    };
    function throwOnDoubleRelease() {
      throw new Error("Release called on client which has already been released to the pool.");
    }
    function promisify(Promise2, callback) {
      if (callback) {
        return { callback, result: void 0 };
      }
      let rej;
      let res;
      const cb = function(err, client) {
        err ? rej(err) : res(client);
      };
      const result = new Promise2(function(resolve, reject) {
        res = resolve;
        rej = reject;
      }).catch((err) => {
        Error.captureStackTrace(err);
        throw err;
      });
      return { callback: cb, result };
    }
    function makeIdleListener(pool, client) {
      return function idleListener(err) {
        err.client = client;
        client.removeListener("error", idleListener);
        client.on("error", () => {
          pool.log("additional client error after disconnection due to error", err);
        });
        pool._remove(client);
        pool.emit("error", err, client);
      };
    }
    var Pool = class extends EventEmitter {
      constructor(options, Client) {
        super();
        this.options = Object.assign({}, options);
        if (options != null && "password" in options) {
          Object.defineProperty(this.options, "password", {
            configurable: true,
            enumerable: false,
            writable: true,
            value: options.password
          });
        }
        if (options != null && options.ssl && options.ssl.key) {
          Object.defineProperty(this.options.ssl, "key", {
            enumerable: false
          });
        }
        this.options.max = this.options.max || this.options.poolSize || 10;
        this.options.min = this.options.min || 0;
        this.options.maxUses = this.options.maxUses || Infinity;
        this.options.allowExitOnIdle = this.options.allowExitOnIdle || false;
        this.options.maxLifetimeSeconds = this.options.maxLifetimeSeconds || 0;
        this.log = this.options.log || function() {
        };
        this.Client = this.options.Client || Client || require_lib2().Client;
        this.Promise = this.options.Promise || global.Promise;
        if (typeof this.options.idleTimeoutMillis === "undefined") {
          this.options.idleTimeoutMillis = 1e4;
        }
        this._clients = [];
        this._idle = [];
        this._expired = /* @__PURE__ */ new WeakSet();
        this._pendingQueue = [];
        this._endCallback = void 0;
        this.ending = false;
        this.ended = false;
      }
      _isFull() {
        return this._clients.length >= this.options.max;
      }
      _isAboveMin() {
        return this._clients.length > this.options.min;
      }
      _pulseQueue() {
        this.log("pulse queue");
        if (this.ended) {
          this.log("pulse queue ended");
          return;
        }
        if (this.ending) {
          this.log("pulse queue on ending");
          if (this._idle.length) {
            this._idle.slice().map((item) => {
              this._remove(item.client);
            });
          }
          if (!this._clients.length) {
            this.ended = true;
            this._endCallback();
          }
          return;
        }
        if (!this._pendingQueue.length) {
          this.log("no queued requests");
          return;
        }
        if (!this._idle.length && this._isFull()) {
          return;
        }
        const pendingItem = this._pendingQueue.shift();
        if (this._idle.length) {
          const idleItem = this._idle.pop();
          clearTimeout(idleItem.timeoutId);
          const client = idleItem.client;
          client.ref && client.ref();
          const idleListener = idleItem.idleListener;
          return this._acquireClient(client, pendingItem, idleListener, false);
        }
        if (!this._isFull()) {
          return this.newClient(pendingItem);
        }
        throw new Error("unexpected condition");
      }
      _remove(client, callback) {
        const removed = removeWhere(this._idle, (item) => item.client === client);
        if (removed !== void 0) {
          clearTimeout(removed.timeoutId);
        }
        this._clients = this._clients.filter((c) => c !== client);
        const context = this;
        client.end(() => {
          context.emit("remove", client);
          if (typeof callback === "function") {
            callback();
          }
        });
      }
      connect(cb) {
        if (this.ending) {
          const err = new Error("Cannot use a pool after calling end on the pool");
          return cb ? cb(err) : this.Promise.reject(err);
        }
        const response = promisify(this.Promise, cb);
        const result = response.result;
        if (this._isFull() || this._idle.length) {
          if (this._idle.length) {
            process.nextTick(() => this._pulseQueue());
          }
          if (!this.options.connectionTimeoutMillis) {
            this._pendingQueue.push(new PendingItem(response.callback));
            return result;
          }
          const queueCallback = (err, res, done) => {
            clearTimeout(tid);
            response.callback(err, res, done);
          };
          const pendingItem = new PendingItem(queueCallback);
          const tid = setTimeout(() => {
            removeWhere(this._pendingQueue, (i) => i.callback === queueCallback);
            pendingItem.timedOut = true;
            response.callback(new Error("timeout exceeded when trying to connect"));
          }, this.options.connectionTimeoutMillis);
          if (tid.unref) {
            tid.unref();
          }
          this._pendingQueue.push(pendingItem);
          return result;
        }
        this.newClient(new PendingItem(response.callback));
        return result;
      }
      newClient(pendingItem) {
        const client = new this.Client(this.options);
        this._clients.push(client);
        const idleListener = makeIdleListener(this, client);
        this.log("checking client timeout");
        let tid;
        let timeoutHit = false;
        if (this.options.connectionTimeoutMillis) {
          tid = setTimeout(() => {
            this.log("ending client due to timeout");
            timeoutHit = true;
            client.connection ? client.connection.stream.destroy() : client.end();
          }, this.options.connectionTimeoutMillis);
        }
        this.log("connecting new client");
        client.connect((err) => {
          if (tid) {
            clearTimeout(tid);
          }
          client.on("error", idleListener);
          if (err) {
            this.log("client failed to connect", err);
            this._clients = this._clients.filter((c) => c !== client);
            if (timeoutHit) {
              err = new Error("Connection terminated due to connection timeout", { cause: err });
            }
            this._pulseQueue();
            if (!pendingItem.timedOut) {
              pendingItem.callback(err, void 0, NOOP);
            }
          } else {
            this.log("new client connected");
            if (this.options.maxLifetimeSeconds !== 0) {
              const maxLifetimeTimeout = setTimeout(() => {
                this.log("ending client due to expired lifetime");
                this._expired.add(client);
                const idleIndex = this._idle.findIndex((idleItem) => idleItem.client === client);
                if (idleIndex !== -1) {
                  this._acquireClient(
                    client,
                    new PendingItem((err2, client2, clientRelease) => clientRelease()),
                    idleListener,
                    false
                  );
                }
              }, this.options.maxLifetimeSeconds * 1e3);
              maxLifetimeTimeout.unref();
              client.once("end", () => clearTimeout(maxLifetimeTimeout));
            }
            return this._acquireClient(client, pendingItem, idleListener, true);
          }
        });
      }
      // acquire a client for a pending work item
      _acquireClient(client, pendingItem, idleListener, isNew) {
        if (isNew) {
          this.emit("connect", client);
        }
        this.emit("acquire", client);
        client.release = this._releaseOnce(client, idleListener);
        client.removeListener("error", idleListener);
        if (!pendingItem.timedOut) {
          if (isNew && this.options.verify) {
            this.options.verify(client, (err) => {
              if (err) {
                client.release(err);
                return pendingItem.callback(err, void 0, NOOP);
              }
              pendingItem.callback(void 0, client, client.release);
            });
          } else {
            pendingItem.callback(void 0, client, client.release);
          }
        } else {
          if (isNew && this.options.verify) {
            this.options.verify(client, client.release);
          } else {
            client.release();
          }
        }
      }
      // returns a function that wraps _release and throws if called more than once
      _releaseOnce(client, idleListener) {
        let released = false;
        return (err) => {
          if (released) {
            throwOnDoubleRelease();
          }
          released = true;
          this._release(client, idleListener, err);
        };
      }
      // release a client back to the poll, include an error
      // to remove it from the pool
      _release(client, idleListener, err) {
        client.on("error", idleListener);
        client._poolUseCount = (client._poolUseCount || 0) + 1;
        this.emit("release", err, client);
        if (err || this.ending || !client._queryable || client._ending || client._poolUseCount >= this.options.maxUses) {
          if (client._poolUseCount >= this.options.maxUses) {
            this.log("remove expended client");
          }
          return this._remove(client, this._pulseQueue.bind(this));
        }
        const isExpired = this._expired.has(client);
        if (isExpired) {
          this.log("remove expired client");
          this._expired.delete(client);
          return this._remove(client, this._pulseQueue.bind(this));
        }
        let tid;
        if (this.options.idleTimeoutMillis && this._isAboveMin()) {
          tid = setTimeout(() => {
            if (this._isAboveMin()) {
              this.log("remove idle client");
              this._remove(client, this._pulseQueue.bind(this));
            }
          }, this.options.idleTimeoutMillis);
          if (this.options.allowExitOnIdle) {
            tid.unref();
          }
        }
        if (this.options.allowExitOnIdle) {
          client.unref();
        }
        this._idle.push(new IdleItem(client, idleListener, tid));
        this._pulseQueue();
      }
      query(text, values, cb) {
        if (typeof text === "function") {
          const response2 = promisify(this.Promise, text);
          setImmediate(function() {
            return response2.callback(new Error("Passing a function as the first parameter to pool.query is not supported"));
          });
          return response2.result;
        }
        if (typeof values === "function") {
          cb = values;
          values = void 0;
        }
        const response = promisify(this.Promise, cb);
        cb = response.callback;
        this.connect((err, client) => {
          if (err) {
            return cb(err);
          }
          let clientReleased = false;
          const onError = (err2) => {
            if (clientReleased) {
              return;
            }
            clientReleased = true;
            client.release(err2);
            cb(err2);
          };
          client.once("error", onError);
          this.log("dispatching query");
          try {
            client.query(text, values, (err2, res) => {
              this.log("query dispatched");
              client.removeListener("error", onError);
              if (clientReleased) {
                return;
              }
              clientReleased = true;
              client.release(err2);
              if (err2) {
                return cb(err2);
              }
              return cb(void 0, res);
            });
          } catch (err2) {
            client.release(err2);
            return cb(err2);
          }
        });
        return response.result;
      }
      end(cb) {
        this.log("ending");
        if (this.ending) {
          const err = new Error("Called end on pool more than once");
          return cb ? cb(err) : this.Promise.reject(err);
        }
        this.ending = true;
        const promised = promisify(this.Promise, cb);
        this._endCallback = promised.callback;
        this._pulseQueue();
        return promised.result;
      }
      get waitingCount() {
        return this._pendingQueue.length;
      }
      get idleCount() {
        return this._idle.length;
      }
      get expiredCount() {
        return this._clients.reduce((acc, client) => acc + (this._expired.has(client) ? 1 : 0), 0);
      }
      get totalCount() {
        return this._clients.length;
      }
    };
    module2.exports = Pool;
  }
});

// node_modules/.pnpm/pg@8.18.0/node_modules/pg/lib/native/query.js
var require_query2 = __commonJS({
  "node_modules/.pnpm/pg@8.18.0/node_modules/pg/lib/native/query.js"(exports2, module2) {
    "use strict";
    var EventEmitter = require("events").EventEmitter;
    var util = require("util");
    var utils = require_utils();
    var NativeQuery = module2.exports = function(config, values, callback) {
      EventEmitter.call(this);
      config = utils.normalizeQueryConfig(config, values, callback);
      this.text = config.text;
      this.values = config.values;
      this.name = config.name;
      this.queryMode = config.queryMode;
      this.callback = config.callback;
      this.state = "new";
      this._arrayMode = config.rowMode === "array";
      this._emitRowEvents = false;
      this.on(
        "newListener",
        function(event) {
          if (event === "row") this._emitRowEvents = true;
        }.bind(this)
      );
    };
    util.inherits(NativeQuery, EventEmitter);
    var errorFieldMap = {
      sqlState: "code",
      statementPosition: "position",
      messagePrimary: "message",
      context: "where",
      schemaName: "schema",
      tableName: "table",
      columnName: "column",
      dataTypeName: "dataType",
      constraintName: "constraint",
      sourceFile: "file",
      sourceLine: "line",
      sourceFunction: "routine"
    };
    NativeQuery.prototype.handleError = function(err) {
      const fields = this.native.pq.resultErrorFields();
      if (fields) {
        for (const key in fields) {
          const normalizedFieldName = errorFieldMap[key] || key;
          err[normalizedFieldName] = fields[key];
        }
      }
      if (this.callback) {
        this.callback(err);
      } else {
        this.emit("error", err);
      }
      this.state = "error";
    };
    NativeQuery.prototype.then = function(onSuccess, onFailure) {
      return this._getPromise().then(onSuccess, onFailure);
    };
    NativeQuery.prototype.catch = function(callback) {
      return this._getPromise().catch(callback);
    };
    NativeQuery.prototype._getPromise = function() {
      if (this._promise) return this._promise;
      this._promise = new Promise(
        function(resolve, reject) {
          this._once("end", resolve);
          this._once("error", reject);
        }.bind(this)
      );
      return this._promise;
    };
    NativeQuery.prototype.submit = function(client) {
      this.state = "running";
      const self = this;
      this.native = client.native;
      client.native.arrayMode = this._arrayMode;
      let after = function(err, rows, results) {
        client.native.arrayMode = false;
        setImmediate(function() {
          self.emit("_done");
        });
        if (err) {
          return self.handleError(err);
        }
        if (self._emitRowEvents) {
          if (results.length > 1) {
            rows.forEach((rowOfRows, i) => {
              rowOfRows.forEach((row) => {
                self.emit("row", row, results[i]);
              });
            });
          } else {
            rows.forEach(function(row) {
              self.emit("row", row, results);
            });
          }
        }
        self.state = "end";
        self.emit("end", results);
        if (self.callback) {
          self.callback(null, results);
        }
      };
      if (process.domain) {
        after = process.domain.bind(after);
      }
      if (this.name) {
        if (this.name.length > 63) {
          console.error("Warning! Postgres only supports 63 characters for query names.");
          console.error("You supplied %s (%s)", this.name, this.name.length);
          console.error("This can cause conflicts and silent errors executing queries");
        }
        const values = (this.values || []).map(utils.prepareValue);
        if (client.namedQueries[this.name]) {
          if (this.text && client.namedQueries[this.name] !== this.text) {
            const err = new Error(`Prepared statements must be unique - '${this.name}' was used for a different statement`);
            return after(err);
          }
          return client.native.execute(this.name, values, after);
        }
        return client.native.prepare(this.name, this.text, values.length, function(err) {
          if (err) return after(err);
          client.namedQueries[self.name] = self.text;
          return self.native.execute(self.name, values, after);
        });
      } else if (this.values) {
        if (!Array.isArray(this.values)) {
          const err = new Error("Query values must be an array");
          return after(err);
        }
        const vals = this.values.map(utils.prepareValue);
        client.native.query(this.text, vals, after);
      } else if (this.queryMode === "extended") {
        client.native.query(this.text, [], after);
      } else {
        client.native.query(this.text, after);
      }
    };
  }
});

// node_modules/.pnpm/pg@8.18.0/node_modules/pg/lib/native/client.js
var require_client2 = __commonJS({
  "node_modules/.pnpm/pg@8.18.0/node_modules/pg/lib/native/client.js"(exports2, module2) {
    "use strict";
    var Native;
    try {
      Native = require("pg-native");
    } catch (e) {
      throw e;
    }
    var TypeOverrides = require_type_overrides();
    var EventEmitter = require("events").EventEmitter;
    var util = require("util");
    var ConnectionParameters = require_connection_parameters();
    var NativeQuery = require_query2();
    var Client = module2.exports = function(config) {
      EventEmitter.call(this);
      config = config || {};
      this._Promise = config.Promise || global.Promise;
      this._types = new TypeOverrides(config.types);
      this.native = new Native({
        types: this._types
      });
      this._queryQueue = [];
      this._ending = false;
      this._connecting = false;
      this._connected = false;
      this._queryable = true;
      const cp = this.connectionParameters = new ConnectionParameters(config);
      if (config.nativeConnectionString) cp.nativeConnectionString = config.nativeConnectionString;
      this.user = cp.user;
      Object.defineProperty(this, "password", {
        configurable: true,
        enumerable: false,
        writable: true,
        value: cp.password
      });
      this.database = cp.database;
      this.host = cp.host;
      this.port = cp.port;
      this.namedQueries = {};
    };
    Client.Query = NativeQuery;
    util.inherits(Client, EventEmitter);
    Client.prototype._errorAllQueries = function(err) {
      const enqueueError = (query) => {
        process.nextTick(() => {
          query.native = this.native;
          query.handleError(err);
        });
      };
      if (this._hasActiveQuery()) {
        enqueueError(this._activeQuery);
        this._activeQuery = null;
      }
      this._queryQueue.forEach(enqueueError);
      this._queryQueue.length = 0;
    };
    Client.prototype._connect = function(cb) {
      const self = this;
      if (this._connecting) {
        process.nextTick(() => cb(new Error("Client has already been connected. You cannot reuse a client.")));
        return;
      }
      this._connecting = true;
      this.connectionParameters.getLibpqConnectionString(function(err, conString) {
        if (self.connectionParameters.nativeConnectionString) conString = self.connectionParameters.nativeConnectionString;
        if (err) return cb(err);
        self.native.connect(conString, function(err2) {
          if (err2) {
            self.native.end();
            return cb(err2);
          }
          self._connected = true;
          self.native.on("error", function(err3) {
            self._queryable = false;
            self._errorAllQueries(err3);
            self.emit("error", err3);
          });
          self.native.on("notification", function(msg) {
            self.emit("notification", {
              channel: msg.relname,
              payload: msg.extra
            });
          });
          self.emit("connect");
          self._pulseQueryQueue(true);
          cb(null, this);
        });
      });
    };
    Client.prototype.connect = function(callback) {
      if (callback) {
        this._connect(callback);
        return;
      }
      return new this._Promise((resolve, reject) => {
        this._connect((error) => {
          if (error) {
            reject(error);
          } else {
            resolve(this);
          }
        });
      });
    };
    Client.prototype.query = function(config, values, callback) {
      let query;
      let result;
      let readTimeout;
      let readTimeoutTimer;
      let queryCallback;
      if (config === null || config === void 0) {
        throw new TypeError("Client was passed a null or undefined query");
      } else if (typeof config.submit === "function") {
        readTimeout = config.query_timeout || this.connectionParameters.query_timeout;
        result = query = config;
        if (typeof values === "function") {
          config.callback = values;
        }
      } else {
        readTimeout = config.query_timeout || this.connectionParameters.query_timeout;
        query = new NativeQuery(config, values, callback);
        if (!query.callback) {
          let resolveOut, rejectOut;
          result = new this._Promise((resolve, reject) => {
            resolveOut = resolve;
            rejectOut = reject;
          }).catch((err) => {
            Error.captureStackTrace(err);
            throw err;
          });
          query.callback = (err, res) => err ? rejectOut(err) : resolveOut(res);
        }
      }
      if (readTimeout) {
        queryCallback = query.callback;
        readTimeoutTimer = setTimeout(() => {
          const error = new Error("Query read timeout");
          process.nextTick(() => {
            query.handleError(error, this.connection);
          });
          queryCallback(error);
          query.callback = () => {
          };
          const index = this._queryQueue.indexOf(query);
          if (index > -1) {
            this._queryQueue.splice(index, 1);
          }
          this._pulseQueryQueue();
        }, readTimeout);
        query.callback = (err, res) => {
          clearTimeout(readTimeoutTimer);
          queryCallback(err, res);
        };
      }
      if (!this._queryable) {
        query.native = this.native;
        process.nextTick(() => {
          query.handleError(new Error("Client has encountered a connection error and is not queryable"));
        });
        return result;
      }
      if (this._ending) {
        query.native = this.native;
        process.nextTick(() => {
          query.handleError(new Error("Client was closed and is not queryable"));
        });
        return result;
      }
      this._queryQueue.push(query);
      this._pulseQueryQueue();
      return result;
    };
    Client.prototype.end = function(cb) {
      const self = this;
      this._ending = true;
      if (!this._connected) {
        this.once("connect", this.end.bind(this, cb));
      }
      let result;
      if (!cb) {
        result = new this._Promise(function(resolve, reject) {
          cb = (err) => err ? reject(err) : resolve();
        });
      }
      this.native.end(function() {
        self._errorAllQueries(new Error("Connection terminated"));
        process.nextTick(() => {
          self.emit("end");
          if (cb) cb();
        });
      });
      return result;
    };
    Client.prototype._hasActiveQuery = function() {
      return this._activeQuery && this._activeQuery.state !== "error" && this._activeQuery.state !== "end";
    };
    Client.prototype._pulseQueryQueue = function(initialConnection) {
      if (!this._connected) {
        return;
      }
      if (this._hasActiveQuery()) {
        return;
      }
      const query = this._queryQueue.shift();
      if (!query) {
        if (!initialConnection) {
          this.emit("drain");
        }
        return;
      }
      this._activeQuery = query;
      query.submit(this);
      const self = this;
      query.once("_done", function() {
        self._pulseQueryQueue();
      });
    };
    Client.prototype.cancel = function(query) {
      if (this._activeQuery === query) {
        this.native.cancel(function() {
        });
      } else if (this._queryQueue.indexOf(query) !== -1) {
        this._queryQueue.splice(this._queryQueue.indexOf(query), 1);
      }
    };
    Client.prototype.ref = function() {
    };
    Client.prototype.unref = function() {
    };
    Client.prototype.setTypeParser = function(oid, format, parseFn) {
      return this._types.setTypeParser(oid, format, parseFn);
    };
    Client.prototype.getTypeParser = function(oid, format) {
      return this._types.getTypeParser(oid, format);
    };
  }
});

// node_modules/.pnpm/pg@8.18.0/node_modules/pg/lib/native/index.js
var require_native = __commonJS({
  "node_modules/.pnpm/pg@8.18.0/node_modules/pg/lib/native/index.js"(exports2, module2) {
    "use strict";
    module2.exports = require_client2();
  }
});

// node_modules/.pnpm/pg@8.18.0/node_modules/pg/lib/index.js
var require_lib2 = __commonJS({
  "node_modules/.pnpm/pg@8.18.0/node_modules/pg/lib/index.js"(exports2, module2) {
    "use strict";
    var Client = require_client();
    var defaults = require_defaults();
    var Connection = require_connection();
    var Result = require_result();
    var utils = require_utils();
    var Pool = require_pg_pool();
    var TypeOverrides = require_type_overrides();
    var { DatabaseError } = require_dist();
    var { escapeIdentifier, escapeLiteral } = require_utils();
    var poolFactory = (Client2) => {
      return class BoundPool extends Pool {
        constructor(options) {
          super(options, Client2);
        }
      };
    };
    var PG = function(clientConstructor2) {
      this.defaults = defaults;
      this.Client = clientConstructor2;
      this.Query = this.Client.Query;
      this.Pool = poolFactory(this.Client);
      this._pools = [];
      this.Connection = Connection;
      this.types = require_pg_types();
      this.DatabaseError = DatabaseError;
      this.TypeOverrides = TypeOverrides;
      this.escapeIdentifier = escapeIdentifier;
      this.escapeLiteral = escapeLiteral;
      this.Result = Result;
      this.utils = utils;
    };
    var clientConstructor = Client;
    var forceNative = false;
    try {
      forceNative = !!process.env.NODE_PG_FORCE_NATIVE;
    } catch {
    }
    if (forceNative) {
      clientConstructor = require_native();
    }
    module2.exports = new PG(clientConstructor);
    Object.defineProperty(module2.exports, "native", {
      configurable: true,
      enumerable: false,
      get() {
        let native = null;
        try {
          native = new PG(require_native());
        } catch (err) {
          if (err.code !== "MODULE_NOT_FOUND") {
            throw err;
          }
        }
        Object.defineProperty(module2.exports, "native", {
          value: native
        });
        return native;
      }
    });
  }
});

// apps/backend/src/storage_service.ts
var require_storage_service = __commonJS({
  "apps/backend/src/storage_service.ts"(exports2, module2) {
    "use strict";
    var crypto = require("crypto");
    var fs2 = require("fs");
    var fsp = require("fs/promises");
    var path2 = require("path");
    var { Client, Pool } = require_lib2();
    var DEFAULT_SQLITE_FILENAME = "cache.sqlite";
    var DEFAULT_FLUSH_DEBOUNCE_MS = 800;
    var DEFAULT_SYNC_BATCH_SIZE = 50;
    var DEFAULT_SYNC_PULL_INTERVAL_MS = 15e3;
    var DEFAULT_SYNC_BACKOFF_BASE_MS = 1e3;
    var DEFAULT_SYNC_BACKOFF_MAX_MS = 6e4;
    function nowMs() {
      return Date.now();
    }
    function toIso(ms) {
      if (!ms || !Number.isFinite(ms)) return "";
      return new Date(ms).toISOString();
    }
    function deepClone(value) {
      if (value === void 0 || value === null) return value;
      return JSON.parse(JSON.stringify(value));
    }
    function stableHash(raw) {
      return crypto.createHash("sha1").update(String(raw || "")).digest("hex");
    }
    function safeJsonParse(text, fallback = null) {
      if (typeof text !== "string" || !text.trim()) return fallback;
      try {
        return JSON.parse(text);
      } catch (_error) {
        return fallback;
      }
    }
    function calcBackoffMs(attempts) {
      const power = Math.max(0, Number(attempts || 0));
      return Math.min(DEFAULT_SYNC_BACKOFF_MAX_MS, DEFAULT_SYNC_BACKOFF_BASE_MS * 2 ** power);
    }
    function parseRev(rev) {
      const source = String(rev || "").trim();
      if (!source) {
        return { revNo: 0, revTag: "" };
      }
      const [rawNo, rawTag] = source.split("-");
      const revNo = Number(rawNo);
      return {
        revNo: Number.isFinite(revNo) ? revNo : 0,
        revTag: rawTag || ""
      };
    }
    function buildRev(revNo, revTag) {
      return `${Number(revNo || 0)}-${String(revTag || "").trim() || randomTag()}`;
    }
    function randomTag() {
      return crypto.randomUUID().replace(/-/g, "").slice(0, 8);
    }
    function normalizePostgresUrl(raw) {
      let value = String(raw || "").trim();
      if (!value) return "";
      const hasWrappingQuotes = value.startsWith('"') && value.endsWith('"') || value.startsWith("'") && value.endsWith("'") || value.startsWith("`") && value.endsWith("`");
      if (hasWrappingQuotes && value.length > 1) {
        value = value.slice(1, -1).trim();
      }
      if (/^postgresql:\/\//i.test(value)) {
        return value.replace(/^postgresql:\/\//i, "postgres://");
      }
      return value;
    }
    function extractConversationPreview(sessionObject) {
      const messages = Array.isArray(sessionObject?.chat_show) ? sessionObject.chat_show : Array.isArray(sessionObject?.history) ? sessionObject.history : [];
      const candidate = messages.find((msg) => msg?.role === "user" || msg?.role === "assistant");
      if (!candidate) return "";
      const content = candidate.content;
      if (typeof content === "string") {
        return content.slice(0, 120).trim();
      }
      if (Array.isArray(content)) {
        const textParts = content.filter((part) => part && part.type === "text" && typeof part.text === "string").map((part) => part.text.trim()).filter(Boolean);
        return textParts.join(" ").slice(0, 120).trim();
      }
      return "";
    }
    function isSessionPayload(sessionObject) {
      if (!sessionObject || typeof sessionObject !== "object") return false;
      if (sessionObject.anywhere_history === true) return true;
      if (Array.isArray(sessionObject.chat_show)) return true;
      if (Array.isArray(sessionObject.history)) return true;
      return false;
    }
    function extractPostgresUrlFromConfigDoc(docData) {
      const value = docData?.config?.database?.postgresUrl;
      return normalizePostgresUrl(value);
    }
    function maskPostgresUrl(url) {
      const source = normalizePostgresUrl(url);
      if (!source) return "";
      try {
        const parsed = new URL(source);
        const host = parsed.hostname || "unknown";
        const port = parsed.port ? `:${parsed.port}` : "";
        const dbName = parsed.pathname && parsed.pathname !== "/" ? parsed.pathname.slice(1) : "";
        return dbName ? `${host}${port}/${dbName}` : `${host}${port}`;
      } catch (_error) {
        const atIndex = source.lastIndexOf("@");
        if (atIndex >= 0 && atIndex < source.length - 1) {
          return source.slice(atIndex + 1);
        }
        return "configured";
      }
    }
    async function testPostgresConnection2(connectionString) {
      const dsn = normalizePostgresUrl(connectionString);
      if (!dsn) {
        return {
          ok: false,
          error: "Postgres connection string is empty."
        };
      }
      const client = new Client({
        connectionString: dsn,
        connectionTimeoutMillis: 5e3,
        statement_timeout: 5e3
      });
      try {
        await client.connect();
        await client.query("SELECT 1");
        return { ok: true };
      } catch (error) {
        return {
          ok: false,
          error: String(error?.message || error)
        };
      } finally {
        try {
          await client.end();
        } catch (_endError) {
        }
      }
    }
    var StorageService2 = class {
      constructor(options = {}) {
        this.dataRoot = options.dataRoot;
        this.legacyDocsPath = options.legacyDocsPath || "";
        this.sqliteFilename = options.sqliteFilename || DEFAULT_SQLITE_FILENAME;
        this.flushDebounceMs = Number.isFinite(options.flushDebounceMs) && options.flushDebounceMs > 0 ? Number(options.flushDebounceMs) : DEFAULT_FLUSH_DEBOUNCE_MS;
        this.syncBatchSize = Number.isFinite(options.syncBatchSize) && options.syncBatchSize > 0 ? Number(options.syncBatchSize) : DEFAULT_SYNC_BATCH_SIZE;
        this.syncPullIntervalMs = Number.isFinite(options.syncPullIntervalMs) && options.syncPullIntervalMs > 0 ? Number(options.syncPullIntervalMs) : DEFAULT_SYNC_PULL_INTERVAL_MS;
        this.sqlitePath = path2.join(this.dataRoot, this.sqliteFilename);
        this.SQL = null;
        this.db = null;
        this.initialized = false;
        this.initPromise = null;
        this.flushTimer = null;
        this.syncTimer = null;
        this.flushInProgress = false;
        this.syncInFlight = false;
        this.pgPool = null;
        this.pgDsn = "";
        this.pgConnected = false;
        this.onSyncSummary = typeof options.onSyncSummary === "function" ? options.onSyncSummary : null;
        this.lastError = "";
        this.lastSyncAt = 0;
      }
      isReady() {
        return this.initialized && !!this.db;
      }
      getMode() {
        const configured = !!this.getConfiguredPostgresUrl();
        if (!configured) return "sqlite-only";
        return this.pgConnected ? "hybrid-online" : "hybrid-offline";
      }
      async init() {
        if (this.initialized && this.db) return this;
        if (this.initPromise) return this.initPromise;
        this.initPromise = this._initInternal().then(() => {
          this.initialized = true;
          this.initPromise = null;
          return this;
        }).catch((error) => {
          this.initPromise = null;
          throw error;
        });
        return this.initPromise;
      }
      async _initInternal() {
        if (!this.dataRoot) {
          throw new Error("StorageService requires dataRoot.");
        }
        await fsp.mkdir(this.dataRoot, { recursive: true });
        const initSqlJsRaw = require("sql.js/dist/sql-wasm.js");
        const initSqlJs = typeof initSqlJsRaw === "function" ? initSqlJsRaw : initSqlJsRaw.default || initSqlJsRaw;
        const wasmBinary = fs2.readFileSync(require.resolve("sql.js/dist/sql-wasm.wasm"));
        this.SQL = await initSqlJs({ wasmBinary });
        if (fs2.existsSync(this.sqlitePath)) {
          const fileBuffer = fs2.readFileSync(this.sqlitePath);
          this.db = new this.SQL.Database(fileBuffer);
        } else {
          this.db = new this.SQL.Database();
        }
        this.execMany([
          "PRAGMA journal_mode = WAL;",
          "PRAGMA synchronous = NORMAL;",
          "PRAGMA temp_store = MEMORY;",
          "PRAGMA foreign_keys = ON;",
          `
      CREATE TABLE IF NOT EXISTS docs (
        id TEXT PRIMARY KEY,
        rev_no INTEGER NOT NULL,
        rev_tag TEXT NOT NULL,
        data_json TEXT NOT NULL,
        updated_at INTEGER NOT NULL,
        scope TEXT DEFAULT ''
      );
      `,
          `
      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        assistant_code TEXT NOT NULL,
        conversation_name TEXT NOT NULL,
        preview TEXT NOT NULL DEFAULT '',
        session_json TEXT NOT NULL,
        size_bytes INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        deleted_at INTEGER NULL
      );
      `,
          "CREATE INDEX IF NOT EXISTS idx_conversations_assistant_updated ON conversations (assistant_code, updated_at DESC);",
          "CREATE INDEX IF NOT EXISTS idx_conversations_deleted_updated ON conversations (deleted_at, updated_at DESC);",
          `
      CREATE TABLE IF NOT EXISTS outbox (
        seq INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        op TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0,
        next_retry_at INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL
      );
      `,
          "CREATE INDEX IF NOT EXISTS idx_outbox_retry_seq ON outbox (next_retry_at, seq);",
          `
      CREATE TABLE IF NOT EXISTS meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
      `
        ]);
        await this.runLegacyMigrations();
        this.scheduleFlush();
        this.scheduleSync(50);
      }
      async dispose() {
        if (this.syncTimer) {
          clearTimeout(this.syncTimer);
          this.syncTimer = null;
        }
        if (this.flushTimer) {
          clearTimeout(this.flushTimer);
          this.flushTimer = null;
        }
        await this.flushNow();
        if (this.pgPool) {
          try {
            await this.pgPool.end();
          } catch (_error) {
          }
          this.pgPool = null;
        }
        if (this.db) {
          try {
            this.db.close();
          } catch (_error) {
          }
          this.db = null;
        }
        this.initialized = false;
      }
      ensureReady() {
        if (!this.db) {
          throw new Error("StorageService is not initialized.");
        }
      }
      execMany(sqlList = []) {
        this.ensureReady();
        sqlList.forEach((sql) => {
          this.db.exec(sql);
        });
      }
      runStatement(sql, params = []) {
        this.ensureReady();
        const stmt = this.db.prepare(sql);
        try {
          stmt.bind(params);
          const rows = [];
          while (stmt.step()) {
            rows.push(stmt.getAsObject());
          }
          return rows;
        } finally {
          stmt.free();
        }
      }
      runMutation(sql, params = []) {
        this.ensureReady();
        const stmt = this.db.prepare(sql);
        try {
          stmt.run(params);
          this.scheduleFlush();
        } finally {
          stmt.free();
        }
      }
      withTransaction(fn) {
        this.ensureReady();
        this.db.exec("BEGIN IMMEDIATE TRANSACTION;");
        try {
          const result = fn();
          this.db.exec("COMMIT;");
          this.scheduleFlush();
          return result;
        } catch (error) {
          this.db.exec("ROLLBACK;");
          throw error;
        }
      }
      scheduleFlush() {
        if (this.flushTimer) {
          clearTimeout(this.flushTimer);
          this.flushTimer = null;
        }
        this.flushTimer = setTimeout(() => {
          this.flushTimer = null;
          this.flushNow().catch((error) => {
            this.lastError = `SQLite flush failed: ${String(error?.message || error)}`;
          });
        }, this.flushDebounceMs);
      }
      async flushNow() {
        if (!this.db || this.flushInProgress) return;
        this.flushInProgress = true;
        try {
          const payload = Buffer.from(this.db.export());
          const tempPath = `${this.sqlitePath}.tmp`;
          await fsp.writeFile(tempPath, payload);
          await fsp.rename(tempPath, this.sqlitePath);
        } finally {
          this.flushInProgress = false;
        }
      }
      getMeta(key) {
        const rows = this.runStatement("SELECT value FROM meta WHERE key = ? LIMIT 1;", [String(key)]);
        if (!rows.length) return "";
        return String(rows[0].value || "");
      }
      setMeta(key, value) {
        const now = String(value ?? "");
        this.runMutation(
          `
      INSERT INTO meta (key, value)
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value;
      `,
          [String(key), now]
        );
      }
      getConfiguredPostgresUrl() {
        const explicit = normalizePostgresUrl(this.pgDsn);
        if (explicit) return explicit;
        const configDoc = this.docGetSync("config");
        if (!configDoc || !configDoc.data) return "";
        return extractPostgresUrlFromConfigDoc(configDoc.data);
      }
      updateConfiguredPostgresUrl(url) {
        const normalized = normalizePostgresUrl(url);
        if (this.pgDsn === normalized) return;
        this.pgDsn = normalized;
        this.pgConnected = false;
        if (this.pgPool) {
          const pool = this.pgPool;
          this.pgPool = null;
          pool.end().catch(() => {
          });
        }
        if (!normalized) {
          this.lastError = "";
          return;
        }
        this.scheduleSync(100);
      }
      async ensurePostgresReady() {
        const dsn = this.getConfiguredPostgresUrl();
        if (!dsn) {
          this.pgConnected = false;
          return false;
        }
        if (this.pgPool && this.pgDsn === dsn && this.pgConnected) {
          return true;
        }
        this.updateConfiguredPostgresUrl(dsn);
        const pool = new Pool({
          connectionString: dsn,
          max: 2,
          idleTimeoutMillis: 3e4,
          connectionTimeoutMillis: 5e3,
          statement_timeout: 1e4
        });
        try {
          const client = await pool.connect();
          try {
            await client.query("SELECT 1");
            await client.query(`
          CREATE TABLE IF NOT EXISTS app_docs (
            id TEXT PRIMARY KEY,
            data_json JSONB NOT NULL,
            updated_at TIMESTAMPTZ NOT NULL
          );
        `);
            await client.query(`
          CREATE TABLE IF NOT EXISTS app_conversations (
            id TEXT PRIMARY KEY,
            assistant_code TEXT NOT NULL,
            conversation_name TEXT NOT NULL,
            preview TEXT NOT NULL DEFAULT '',
            session_json JSONB NOT NULL,
            size_bytes INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMPTZ NOT NULL,
            updated_at TIMESTAMPTZ NOT NULL,
            deleted_at TIMESTAMPTZ NULL
          );
        `);
            await client.query(
              "CREATE INDEX IF NOT EXISTS idx_app_conversations_assistant_updated ON app_conversations (assistant_code, updated_at DESC);"
            );
            await client.query(
              "CREATE INDEX IF NOT EXISTS idx_app_conversations_updated_id ON app_conversations (updated_at ASC, id ASC);"
            );
          } finally {
            client.release();
          }
          if (this.pgPool && this.pgPool !== pool) {
            this.pgPool.end().catch(() => {
            });
          }
          this.pgPool = pool;
          this.pgDsn = dsn;
          this.pgConnected = true;
          this.lastError = "";
          await this.seedOutboxForSnapshotIfNeeded(dsn);
          return true;
        } catch (error) {
          try {
            await pool.end();
          } catch (_endError) {
          }
          this.pgConnected = false;
          this.lastError = `Postgres connection failed: ${String(error?.message || error)}`;
          return false;
        }
      }
      async seedOutboxForSnapshotIfNeeded(dsn) {
        const fingerprint = stableHash(dsn).slice(0, 12);
        const metaKey = `pg_seeded_${fingerprint}`;
        if (this.getMeta(metaKey) === "true") return;
        const docs = this.runStatement("SELECT id, data_json, updated_at FROM docs;");
        docs.forEach((row) => {
          this.enqueueOutbox("doc", row.id, "upsert", {
            id: row.id,
            data: safeJsonParse(row.data_json, {}),
            updatedAt: Number(row.updated_at || nowMs())
          });
        });
        const conversations = this.runStatement(
          `
      SELECT id, assistant_code, conversation_name, preview, session_json,
             size_bytes, created_at, updated_at, deleted_at
      FROM conversations;
      `
        );
        conversations.forEach((row) => {
          const normalized = this.normalizeConversationForSync({
            id: row.id,
            assistantCode: row.assistant_code,
            conversationName: row.conversation_name,
            preview: row.preview,
            sessionJson: row.session_json,
            sizeBytes: Number(row.size_bytes || 0),
            createdAt: Number(row.created_at || nowMs()),
            updatedAt: Number(row.updated_at || nowMs()),
            deletedAt: row.deleted_at === null || row.deleted_at === void 0 ? null : Number(row.deleted_at)
          });
          this.enqueueOutbox("conversation", row.id, "upsert", {
            id: normalized.id,
            assistantCode: normalized.assistantCode,
            conversationName: normalized.conversationName,
            preview: normalized.preview,
            sessionJson: normalized.sessionJson,
            sizeBytes: normalized.sizeBytes,
            createdAt: normalized.createdAt,
            updatedAt: normalized.updatedAt,
            deletedAt: normalized.deletedAt
          });
        });
        this.setMeta(metaKey, "true");
        this.scheduleSync(100);
      }
      enqueueOutbox(entityType, entityId, op, payload) {
        const dsn = this.getConfiguredPostgresUrl();
        if (!dsn) return;
        this.runMutation(
          `
      INSERT INTO outbox (entity_type, entity_id, op, payload_json, attempts, next_retry_at, created_at)
      VALUES (?, ?, ?, ?, 0, 0, ?);
      `,
          [String(entityType), String(entityId), String(op), JSON.stringify(payload ?? {}), nowMs()]
        );
      }
      getOutboxQueueSize() {
        const rows = this.runStatement("SELECT COUNT(*) AS count FROM outbox;");
        return Number(rows[0]?.count || 0);
      }
      getStorageHealth() {
        const dsn = this.getConfiguredPostgresUrl();
        const configured = !!dsn;
        return {
          mode: this.getMode(),
          postgresConfigured: configured,
          postgresConnected: configured ? this.pgConnected : false,
          postgresTarget: configured ? maskPostgresUrl(dsn) : "",
          queueSize: this.getOutboxQueueSize(),
          lastSyncAt: this.lastSyncAt ? toIso(this.lastSyncAt) : "",
          lastError: this.lastError || ""
        };
      }
      emitSyncSummary(summary = {}) {
        if (typeof this.onSyncSummary !== "function") return;
        try {
          this.onSyncSummary(summary);
        } catch (_error) {
        }
      }
      getPostgresFingerprint(dsn = "") {
        const source = normalizePostgresUrl(dsn);
        if (!source) return "";
        return stableHash(source).slice(0, 12);
      }
      getConversationPullCursorMetaKey(dsn = "") {
        const fingerprint = this.getPostgresFingerprint(dsn);
        if (!fingerprint) return "";
        return `pg_conversation_cursor_${fingerprint}`;
      }
      getConversationPullCursor(dsn = "") {
        const metaKey = this.getConversationPullCursorMetaKey(dsn);
        if (!metaKey) {
          return { updatedAt: 0, id: "" };
        }
        const parsed = safeJsonParse(this.getMeta(metaKey), null);
        const updatedAt = Number(parsed?.updatedAt || 0);
        return {
          updatedAt: Number.isFinite(updatedAt) && updatedAt > 0 ? updatedAt : 0,
          id: String(parsed?.id || "")
        };
      }
      setConversationPullCursor(dsn = "", cursor = {}) {
        const metaKey = this.getConversationPullCursorMetaKey(dsn);
        if (!metaKey) return;
        const updatedAt = Number(cursor?.updatedAt || 0);
        this.setMeta(
          metaKey,
          JSON.stringify({
            updatedAt: Number.isFinite(updatedAt) && updatedAt > 0 ? updatedAt : 0,
            id: String(cursor?.id || "")
          })
        );
      }
      normalizeConversationForSync(raw = {}) {
        const conversationId = String(raw.conversationId || raw.id || "").trim();
        let sessionObject = raw.sessionData;
        if (!sessionObject && raw.session_json) {
          sessionObject = typeof raw.session_json === "string" ? safeJsonParse(raw.session_json, null) : raw.session_json;
        }
        if (!sessionObject && raw.sessionJson) {
          sessionObject = typeof raw.sessionJson === "string" ? safeJsonParse(raw.sessionJson, null) : raw.sessionJson;
        }
        if (!sessionObject || typeof sessionObject !== "object") {
          sessionObject = {};
        }
        const assistantCode = String(raw.assistantCode || raw.CODE || sessionObject.CODE || "AI").trim() || "AI";
        const conversationName = String(
          raw.conversationName || raw.name || sessionObject.conversationName || `Session-${assistantCode}-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}`
        ).trim();
        const canonicalSession = deepClone(sessionObject) || {};
        canonicalSession.CODE = assistantCode;
        canonicalSession.conversationName = conversationName;
        if (conversationId) {
          canonicalSession.conversationId = conversationId;
        }
        const sessionJson = JSON.stringify(canonicalSession);
        const createdAtRaw = Number(raw.createdAt || raw.created_at || 0);
        const updatedAtRaw = Number(raw.updatedAt || raw.updated_at || createdAtRaw || nowMs());
        const deletedAtRaw = raw.deletedAt === null || raw.deleted_at === null || raw.deletedAt === void 0 || raw.deleted_at === void 0 ? null : Number(raw.deletedAt ?? raw.deleted_at);
        return {
          id: conversationId,
          assistantCode,
          conversationName,
          preview: String(raw.preview || extractConversationPreview(canonicalSession) || "").trim(),
          sessionObject: canonicalSession,
          sessionJson,
          sizeBytes: Number(raw.sizeBytes || raw.size_bytes || Buffer.byteLength(sessionJson, "utf8")),
          createdAt: Number.isFinite(createdAtRaw) && createdAtRaw > 0 ? Math.floor(createdAtRaw) : Math.floor(nowMs()),
          updatedAt: Number.isFinite(updatedAtRaw) && updatedAtRaw > 0 ? updatedAtRaw : nowMs(),
          deletedAt: deletedAtRaw === null || !Number.isFinite(deletedAtRaw) || deletedAtRaw <= 0 ? null : Math.floor(deletedAtRaw)
        };
      }
      buildConversationVersionSignature(record = {}) {
        return stableHash(
          JSON.stringify({
            assistantCode: String(record.assistantCode || ""),
            conversationName: String(record.conversationName || ""),
            preview: String(record.preview || ""),
            sessionJson: String(record.sessionJson || ""),
            sizeBytes: Number(record.sizeBytes || 0),
            deletedAt: record.deletedAt === null || record.deletedAt === void 0 ? null : Number(record.deletedAt || 0)
          })
        );
      }
      compareConversationVersions(left, right) {
        const leftUpdatedAt = Number(left?.updatedAt || 0);
        const rightUpdatedAt = Number(right?.updatedAt || 0);
        if (leftUpdatedAt !== rightUpdatedAt) {
          return leftUpdatedAt > rightUpdatedAt ? 1 : -1;
        }
        const leftSig = this.buildConversationVersionSignature(left);
        const rightSig = this.buildConversationVersionSignature(right);
        if (leftSig === rightSig) return 0;
        return leftSig > rightSig ? 1 : -1;
      }
      async getRemoteConversationSnapshotById(client, conversationId) {
        const rows = await client.query(
          `
      SELECT id, assistant_code, conversation_name, preview, session_json::text AS session_json_text,
             size_bytes,
             EXTRACT(EPOCH FROM created_at) * 1000 AS created_at_ms,
             EXTRACT(EPOCH FROM updated_at) * 1000 AS updated_at_ms,
             CASE
               WHEN deleted_at IS NULL THEN NULL
               ELSE EXTRACT(EPOCH FROM deleted_at) * 1000
             END AS deleted_at_ms
      FROM app_conversations
      WHERE id = $1
      LIMIT 1;
      `,
          [String(conversationId || "").trim()]
        );
        if (!rows?.rows?.length) return null;
        const row = rows.rows[0];
        const remote = this.normalizeConversationForSync({
          id: row.id,
          assistantCode: row.assistant_code,
          conversationName: row.conversation_name,
          preview: row.preview,
          sessionJson: typeof row.session_json_text === "string" && row.session_json_text ? row.session_json_text : row.session_json,
          sizeBytes: Number(row.size_bytes || 0),
          createdAt: Number(row.created_at_ms || 0),
          updatedAt: Number(row.updated_at_ms || 0),
          deletedAt: row.deleted_at_ms === null || row.deleted_at_ms === void 0 ? null : Number(row.deleted_at_ms)
        });
        if (!remote.id) return null;
        return remote;
      }
      applyRemoteConversation(remoteRecord) {
        if (!remoteRecord?.id) {
          return { applied: false, stale: false };
        }
        const localRows = this.runStatement(
          `
      SELECT id, assistant_code, conversation_name, preview, session_json,
             size_bytes, created_at, updated_at, deleted_at
      FROM conversations
      WHERE id = ?
      LIMIT 1;
      `,
          [remoteRecord.id]
        );
        if (!localRows.length) {
          this.runMutation(
            `
        INSERT INTO conversations (
          id, assistant_code, conversation_name, preview,
          session_json, size_bytes, created_at, updated_at, deleted_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          assistant_code = excluded.assistant_code,
          conversation_name = excluded.conversation_name,
          preview = excluded.preview,
          session_json = excluded.session_json,
          size_bytes = excluded.size_bytes,
          created_at = excluded.created_at,
          updated_at = excluded.updated_at,
          deleted_at = excluded.deleted_at;
        `,
            [
              remoteRecord.id,
              remoteRecord.assistantCode,
              remoteRecord.conversationName,
              remoteRecord.preview,
              remoteRecord.sessionJson,
              remoteRecord.sizeBytes,
              remoteRecord.createdAt,
              remoteRecord.updatedAt,
              remoteRecord.deletedAt
            ]
          );
          return { applied: true, stale: false };
        }
        const local = this.normalizeConversationForSync({
          id: localRows[0].id,
          assistantCode: localRows[0].assistant_code,
          conversationName: localRows[0].conversation_name,
          preview: localRows[0].preview,
          sessionJson: localRows[0].session_json,
          sizeBytes: Number(localRows[0].size_bytes || 0),
          createdAt: Number(localRows[0].created_at || 0),
          updatedAt: Number(localRows[0].updated_at || 0),
          deletedAt: localRows[0].deleted_at === null || localRows[0].deleted_at === void 0 ? null : Number(localRows[0].deleted_at)
        });
        const compareResult = this.compareConversationVersions(local, remoteRecord);
        if (compareResult > 0) {
          return { applied: false, stale: true };
        }
        if (compareResult === 0) {
          return { applied: false, stale: false };
        }
        const createdAt = Number.isFinite(local.createdAt) && local.createdAt > 0 ? Math.min(local.createdAt, remoteRecord.createdAt || local.createdAt) : remoteRecord.createdAt;
        this.runMutation(
          `
      UPDATE conversations
      SET assistant_code = ?,
          conversation_name = ?,
          preview = ?,
          session_json = ?,
          size_bytes = ?,
          created_at = ?,
          updated_at = ?,
          deleted_at = ?
      WHERE id = ?;
      `,
          [
            remoteRecord.assistantCode,
            remoteRecord.conversationName,
            remoteRecord.preview,
            remoteRecord.sessionJson,
            remoteRecord.sizeBytes,
            createdAt,
            remoteRecord.updatedAt,
            remoteRecord.deletedAt,
            remoteRecord.id
          ]
        );
        return { applied: true, stale: false };
      }
      async pullRemoteConversations() {
        const dsn = this.getConfiguredPostgresUrl();
        if (!dsn || !this.pgPool) {
          return { pulled: 0, applied: 0, staleSkipped: 0 };
        }
        const client = await this.pgPool.connect();
        const cursor = this.getConversationPullCursor(dsn);
        const nextCursor = {
          updatedAt: Number(cursor.updatedAt || 0),
          id: String(cursor.id || "")
        };
        let pulled = 0;
        let applied = 0;
        let staleSkipped = 0;
        try {
          while (true) {
            const result = await client.query(
              `
          SELECT id, assistant_code, conversation_name, preview, session_json::text AS session_json_text,
                 size_bytes,
                 EXTRACT(EPOCH FROM created_at) * 1000 AS created_at_ms,
                 EXTRACT(EPOCH FROM updated_at) * 1000 AS updated_at_ms,
                 CASE
                   WHEN deleted_at IS NULL THEN NULL
                   ELSE EXTRACT(EPOCH FROM deleted_at) * 1000
                 END AS deleted_at_ms
          FROM app_conversations
          WHERE (
              updated_at > to_timestamp($1::double precision / 1000.0)
              OR (
                updated_at = to_timestamp($1::double precision / 1000.0)
                AND id > $2
              )
            )
          ORDER BY updated_at ASC, id ASC
          LIMIT $3;
          `,
              [nextCursor.updatedAt, nextCursor.id, this.syncBatchSize]
            );
            const rows = result?.rows || [];
            if (!rows.length) break;
            for (const row of rows) {
              const remoteRecord = this.normalizeConversationForSync({
                id: row.id,
                assistantCode: row.assistant_code,
                conversationName: row.conversation_name,
                preview: row.preview,
                sessionJson: typeof row.session_json_text === "string" && row.session_json_text ? row.session_json_text : row.session_json,
                sizeBytes: Number(row.size_bytes || 0),
                createdAt: Number(row.created_at_ms || 0),
                updatedAt: Number(row.updated_at_ms || 0),
                deletedAt: row.deleted_at_ms === null || row.deleted_at_ms === void 0 ? null : Number(row.deleted_at_ms)
              });
              if (!remoteRecord.id) continue;
              pulled += 1;
              const merged = this.applyRemoteConversation(remoteRecord);
              if (merged.applied) {
                applied += 1;
              } else if (merged.stale) {
                staleSkipped += 1;
              }
              nextCursor.updatedAt = remoteRecord.updatedAt;
              nextCursor.id = remoteRecord.id;
            }
          }
        } finally {
          client.release();
          this.setConversationPullCursor(dsn, nextCursor);
        }
        return { pulled, applied, staleSkipped };
      }
      scheduleSync(delayMs = 0) {
        if (this.syncTimer) {
          clearTimeout(this.syncTimer);
          this.syncTimer = null;
        }
        this.syncTimer = setTimeout(
          () => {
            this.syncTimer = null;
            this.syncNow().catch((error) => {
              this.lastError = `Sync failed: ${String(error?.message || error)}`;
            });
          },
          Math.max(0, Number(delayMs) || 0)
        );
      }
      async syncNow() {
        await this.init();
        if (this.syncInFlight) {
          return { ok: true, skipped: true, reason: "in-flight" };
        }
        const configured = !!this.getConfiguredPostgresUrl();
        if (!configured) {
          this.pgConnected = false;
          this.lastError = "";
          return { ok: true, skipped: true, reason: "sqlite-only" };
        }
        this.syncInFlight = true;
        let pushed = 0;
        let pulled = 0;
        let applied = 0;
        let staleSkipped = 0;
        let failed = 0;
        try {
          const ready = await this.ensurePostgresReady();
          if (!ready || !this.pgPool) {
            this.scheduleSync(calcBackoffMs(1));
            const summary2 = {
              ok: false,
              pushed,
              pulled,
              applied,
              staleSkipped,
              processed: pushed,
              failed,
              error: this.lastError || "Postgres unavailable"
            };
            this.emitSyncSummary(summary2);
            return summary2;
          }
          while (true) {
            const rows = this.runStatement(
              `
          SELECT seq, entity_type, entity_id, op, payload_json, attempts
          FROM outbox
          WHERE next_retry_at <= ?
          ORDER BY seq ASC
          LIMIT ?;
          `,
              [nowMs(), this.syncBatchSize]
            );
            if (!rows.length) break;
            for (const row of rows) {
              try {
                const result = await this.applyOutboxRow(row);
                this.runMutation("DELETE FROM outbox WHERE seq = ?;", [row.seq]);
                if (result?.stale) {
                  staleSkipped += 1;
                } else if (result?.applied !== false) {
                  pushed += 1;
                }
              } catch (error) {
                const attempts = Number(row.attempts || 0) + 1;
                const delay2 = calcBackoffMs(attempts);
                this.runMutation("UPDATE outbox SET attempts = ?, next_retry_at = ? WHERE seq = ?;", [
                  attempts,
                  nowMs() + delay2,
                  row.seq
                ]);
                failed += 1;
                this.pgConnected = false;
                this.lastError = String(error?.message || error);
                if (/(ECONN|timeout|connect|closed|terminat|refused|network|socket)/i.test(this.lastError)) {
                  throw error;
                }
              }
            }
            if (failed > 0) {
              break;
            }
          }
          if (failed === 0) {
            const pullResult = await this.pullRemoteConversations();
            pulled = Number(pullResult?.pulled || 0);
            applied = Number(pullResult?.applied || 0);
            staleSkipped += Number(pullResult?.staleSkipped || 0);
          }
          this.pgConnected = true;
          if (failed === 0) {
            this.lastError = "";
          }
          this.lastSyncAt = nowMs();
          this.scheduleSync(this.syncPullIntervalMs);
          const summary = {
            ok: failed === 0,
            pushed,
            pulled,
            applied,
            staleSkipped,
            processed: pushed,
            failed,
            error: failed === 0 ? "" : this.lastError
          };
          this.emitSyncSummary(summary);
          return summary;
        } catch (error) {
          this.pgConnected = false;
          this.lastError = String(error?.message || error);
          this.scheduleSync(calcBackoffMs(1));
          const summary = {
            ok: false,
            pushed,
            pulled,
            applied,
            staleSkipped,
            processed: pushed,
            failed,
            error: this.lastError
          };
          this.emitSyncSummary(summary);
          return summary;
        } finally {
          this.syncInFlight = false;
        }
      }
      async applyOutboxRow(row) {
        const payload = safeJsonParse(row.payload_json, {});
        const client = await this.pgPool.connect();
        try {
          if (row.entity_type === "doc") {
            if (row.op === "delete") {
              await client.query("DELETE FROM app_docs WHERE id = $1;", [
                String(payload.id || row.entity_id)
              ]);
              return { applied: true, stale: false };
            }
            const updatedAt = Number(payload.updatedAt || nowMs());
            await client.query(
              `
          INSERT INTO app_docs (id, data_json, updated_at)
          VALUES ($1, $2::jsonb, to_timestamp($3::double precision / 1000.0))
          ON CONFLICT (id) DO UPDATE
          SET data_json = excluded.data_json,
              updated_at = excluded.updated_at;
          `,
              [String(payload.id || row.entity_id), JSON.stringify(payload.data ?? {}), updatedAt]
            );
            return { applied: true, stale: false };
          }
          if (row.entity_type === "conversation") {
            const conversationId = String(payload.id || row.entity_id || "").trim();
            if (!conversationId) return { applied: false, stale: false };
            if (row.op === "delete") {
              const deletedAt = Number(payload.deletedAt || nowMs());
              const remoteCurrent2 = await this.getRemoteConversationSnapshotById(
                client,
                conversationId
              );
              if (!remoteCurrent2) {
                return { applied: false, stale: false };
              }
              const localDeleteRecord = {
                id: conversationId,
                assistantCode: remoteCurrent2.assistantCode,
                conversationName: remoteCurrent2.conversationName,
                preview: remoteCurrent2.preview,
                sessionJson: remoteCurrent2.sessionJson,
                sizeBytes: remoteCurrent2.sizeBytes,
                updatedAt: deletedAt,
                deletedAt
              };
              const compareResult = this.compareConversationVersions(localDeleteRecord, remoteCurrent2);
              if (compareResult < 0) {
                return { applied: false, stale: true };
              }
              if (compareResult === 0 && Number(remoteCurrent2.deletedAt || 0) === (Number.isFinite(deletedAt) && deletedAt > 0 ? Math.floor(deletedAt) : 0)) {
                return { applied: false, stale: false };
              }
              await client.query(
                `
            UPDATE app_conversations
            SET deleted_at = to_timestamp($2::double precision / 1000.0),
                updated_at = to_timestamp($2::double precision / 1000.0)
            WHERE id = $1;
            `,
                [conversationId, deletedAt]
              );
              return { applied: true, stale: false };
            }
            const localRecord = this.normalizeConversationForSync({
              id: conversationId,
              assistantCode: payload.assistantCode,
              conversationName: payload.conversationName,
              preview: payload.preview,
              sessionJson: payload.sessionJson,
              sessionData: payload.sessionData,
              sizeBytes: payload.sizeBytes,
              createdAt: payload.createdAt,
              updatedAt: payload.updatedAt,
              deletedAt: payload.deletedAt
            });
            const remoteCurrent = await this.getRemoteConversationSnapshotById(client, conversationId);
            if (remoteCurrent) {
              const compareResult = this.compareConversationVersions(localRecord, remoteCurrent);
              if (compareResult < 0) {
                return { applied: false, stale: true };
              }
              if (compareResult === 0) {
                return { applied: false, stale: false };
              }
            }
            await client.query(
              `
          INSERT INTO app_conversations (
            id,
            assistant_code,
            conversation_name,
            preview,
            session_json,
            size_bytes,
            created_at,
            updated_at,
            deleted_at
          )
          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5::jsonb,
            $6,
            to_timestamp($7::double precision / 1000.0),
            to_timestamp($8::double precision / 1000.0),
            CASE WHEN $9::double precision IS NULL THEN NULL ELSE to_timestamp($9::double precision / 1000.0) END
          )
          ON CONFLICT (id) DO UPDATE
          SET assistant_code = excluded.assistant_code,
              conversation_name = excluded.conversation_name,
              preview = excluded.preview,
              session_json = excluded.session_json,
              size_bytes = excluded.size_bytes,
              created_at = excluded.created_at,
              updated_at = excluded.updated_at,
              deleted_at = excluded.deleted_at;
          `,
              [
                localRecord.id,
                localRecord.assistantCode,
                localRecord.conversationName,
                localRecord.preview,
                localRecord.sessionJson,
                localRecord.sizeBytes,
                localRecord.createdAt,
                localRecord.updatedAt,
                localRecord.deletedAt
              ]
            );
            return { applied: true, stale: false };
          }
          return { applied: false, stale: false };
        } finally {
          client.release();
        }
      }
      docGetSync(id) {
        this.ensureReady();
        const rows = this.runStatement(
          "SELECT id, rev_no, rev_tag, data_json FROM docs WHERE id = ? LIMIT 1;",
          [String(id)]
        );
        if (!rows.length) return null;
        const row = rows[0];
        return {
          _id: row.id,
          _rev: buildRev(row.rev_no, row.rev_tag),
          data: safeJsonParse(row.data_json, {})
        };
      }
      docPutSync(doc) {
        this.ensureReady();
        if (!doc || !doc._id) {
          return { ok: false, error: true, name: "bad_request", message: "Missing _id" };
        }
        const id = String(doc._id);
        const currentRows = this.runStatement(
          "SELECT rev_no, rev_tag FROM docs WHERE id = ? LIMIT 1;",
          [id]
        );
        const existing = currentRows[0] || null;
        const existingRev = existing ? buildRev(existing.rev_no, existing.rev_tag) : "";
        if (existing && doc._rev && String(doc._rev) !== existingRev) {
          return { ok: false, error: true, name: "conflict", message: "Document update conflict" };
        }
        const nextRevNo = existing ? Number(existing.rev_no || 0) + 1 : 1;
        const nextRevTag = randomTag();
        const nextRev = buildRev(nextRevNo, nextRevTag);
        const dataJson = JSON.stringify(deepClone(doc.data));
        const updatedAt = nowMs();
        this.runMutation(
          `
      INSERT INTO docs (id, rev_no, rev_tag, data_json, updated_at, scope)
      VALUES (?, ?, ?, ?, ?, '')
      ON CONFLICT(id) DO UPDATE SET
        rev_no = excluded.rev_no,
        rev_tag = excluded.rev_tag,
        data_json = excluded.data_json,
        updated_at = excluded.updated_at;
      `,
          [id, nextRevNo, nextRevTag, dataJson, updatedAt]
        );
        const docData = safeJsonParse(dataJson, {});
        this.enqueueOutbox("doc", id, "upsert", {
          id,
          data: docData,
          updatedAt
        });
        if (id === "config") {
          this.updateConfiguredPostgresUrl(extractPostgresUrlFromConfigDoc(docData));
        }
        this.scheduleSync(100);
        return { ok: true, id, rev: nextRev };
      }
      docRemoveSync(id) {
        this.ensureReady();
        const key = String(id || "");
        if (!key) {
          return { ok: false, error: true, name: "bad_request", message: "Missing _id" };
        }
        const existing = this.runStatement("SELECT id FROM docs WHERE id = ? LIMIT 1;", [key]);
        if (!existing.length) {
          return { ok: false, error: true, name: "not_found", message: `Document ${key} not found` };
        }
        this.runMutation("DELETE FROM docs WHERE id = ?;", [key]);
        this.enqueueOutbox("doc", key, "delete", { id: key, deletedAt: nowMs() });
        if (key === "config") {
          this.updateConfiguredPostgresUrl("");
        }
        this.scheduleSync(100);
        return { ok: true, id: key };
      }
      getAllDocsLegacy() {
        this.ensureReady();
        const rows = this.runStatement(
          "SELECT id, rev_no, rev_tag, data_json FROM docs ORDER BY id ASC;"
        );
        const result = {};
        rows.forEach((row) => {
          result[row.id] = {
            _id: row.id,
            _rev: buildRev(row.rev_no, row.rev_tag),
            data: safeJsonParse(row.data_json, {})
          };
        });
        return result;
      }
      normalizeConversationPayload(payload = {}) {
        let sessionObject = payload.sessionData;
        if (!sessionObject && payload.session_json) {
          sessionObject = safeJsonParse(payload.session_json, null);
        }
        if (!sessionObject && payload.sessionJson) {
          sessionObject = safeJsonParse(payload.sessionJson, null);
        }
        if (!sessionObject && payload.session) {
          sessionObject = payload.session;
        }
        if (!sessionObject || typeof sessionObject !== "object") {
          throw new Error("Session payload is required and must be an object.");
        }
        const conversationId = String(
          payload.conversationId || payload.id || sessionObject.conversationId || ""
        ).trim();
        const normalized = this.normalizeConversationForSync({
          ...payload,
          id: conversationId || crypto.randomUUID(),
          sessionData: sessionObject,
          sessionJson: JSON.stringify(sessionObject)
        });
        return {
          conversationId: normalized.id,
          assistantCode: normalized.assistantCode,
          conversationName: normalized.conversationName,
          preview: normalized.preview,
          sessionObject: normalized.sessionObject,
          sessionJson: normalized.sessionJson
        };
      }
      upsertConversation(payload = {}) {
        this.ensureReady();
        const normalized = this.normalizeConversationPayload(payload);
        const currentRows = this.runStatement(
          `
      SELECT id, assistant_code, conversation_name, preview, session_json,
             size_bytes, created_at, updated_at, deleted_at
      FROM conversations
      WHERE id = ?
      LIMIT 1;
      `,
          [normalized.conversationId]
        );
        const existing = currentRows[0] || null;
        const createdAt = existing ? Number(existing.created_at || nowMs()) : nowMs();
        const updatedAt = nowMs();
        const sizeBytes = Buffer.byteLength(normalized.sessionJson, "utf8");
        const unchanged = !!existing && existing.deleted_at === null && String(existing.assistant_code || "") === normalized.assistantCode && String(existing.conversation_name || "") === normalized.conversationName && String(existing.preview || "") === normalized.preview && String(existing.session_json || "") === normalized.sessionJson;
        if (unchanged) {
          return {
            ok: true,
            unchanged: true,
            conversationId: normalized.conversationId,
            conversationName: normalized.conversationName,
            assistantCode: normalized.assistantCode,
            preview: normalized.preview,
            size: Number(existing.size_bytes || sizeBytes),
            lastmod: toIso(Number(existing.updated_at || updatedAt))
          };
        }
        this.runMutation(
          `
      INSERT INTO conversations (
        id,
        assistant_code,
        conversation_name,
        preview,
        session_json,
        size_bytes,
        created_at,
        updated_at,
        deleted_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)
      ON CONFLICT(id) DO UPDATE SET
        assistant_code = excluded.assistant_code,
        conversation_name = excluded.conversation_name,
        preview = excluded.preview,
        session_json = excluded.session_json,
        size_bytes = excluded.size_bytes,
        created_at = excluded.created_at,
        updated_at = excluded.updated_at,
        deleted_at = NULL;
      `,
          [
            normalized.conversationId,
            normalized.assistantCode,
            normalized.conversationName,
            normalized.preview,
            normalized.sessionJson,
            sizeBytes,
            createdAt,
            updatedAt
          ]
        );
        this.enqueueOutbox("conversation", normalized.conversationId, "upsert", {
          id: normalized.conversationId,
          assistantCode: normalized.assistantCode,
          conversationName: normalized.conversationName,
          preview: normalized.preview,
          sessionJson: normalized.sessionJson,
          sizeBytes,
          createdAt,
          updatedAt,
          deletedAt: null
        });
        this.scheduleSync(80);
        return {
          ok: true,
          unchanged: false,
          conversationId: normalized.conversationId,
          conversationName: normalized.conversationName,
          assistantCode: normalized.assistantCode,
          preview: normalized.preview,
          size: sizeBytes,
          lastmod: toIso(updatedAt)
        };
      }
      listConversations(filter = {}) {
        this.ensureReady();
        const clauses = [];
        const params = [];
        const includeDeleted = filter.includeDeleted === true;
        if (!includeDeleted) {
          clauses.push("deleted_at IS NULL");
        }
        if (filter.assistantCode) {
          clauses.push("assistant_code = ?");
          params.push(String(filter.assistantCode));
        }
        const whereSql = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
        const limitRaw = Number(filter.limit || 0);
        const limitSql = Number.isFinite(limitRaw) && limitRaw > 0 ? `LIMIT ${Math.floor(limitRaw)}` : "";
        const rows = this.runStatement(
          `
      SELECT id, assistant_code, conversation_name, preview, size_bytes, created_at, updated_at, deleted_at
      FROM conversations
      ${whereSql}
      ORDER BY updated_at DESC
      ${limitSql};
      `,
          params
        );
        return rows.map((row) => ({
          conversationId: row.id,
          assistantCode: row.assistant_code,
          conversationName: row.conversation_name,
          preview: row.preview || "",
          size: Number(row.size_bytes || 0),
          createdAt: toIso(Number(row.created_at || 0)),
          updatedAt: toIso(Number(row.updated_at || 0)),
          lastmod: toIso(Number(row.updated_at || 0)),
          deletedAt: row.deleted_at === null || row.deleted_at === void 0 ? null : toIso(Number(row.deleted_at || 0))
        }));
      }
      getConversation(conversationId) {
        this.ensureReady();
        const id = String(conversationId || "").trim();
        if (!id) return null;
        const rows = this.runStatement(
          `
      SELECT id, assistant_code, conversation_name, preview, session_json,
             size_bytes, created_at, updated_at, deleted_at
      FROM conversations
      WHERE id = ?
      LIMIT 1;
      `,
          [id]
        );
        if (!rows.length) return null;
        const row = rows[0];
        const normalized = this.normalizeConversationForSync({
          id: row.id,
          assistantCode: row.assistant_code,
          conversationName: row.conversation_name,
          preview: row.preview,
          sessionJson: row.session_json,
          sizeBytes: Number(row.size_bytes || 0),
          createdAt: Number(row.created_at || 0),
          updatedAt: Number(row.updated_at || 0),
          deletedAt: row.deleted_at === null || row.deleted_at === void 0 ? null : Number(row.deleted_at)
        });
        return {
          conversationId: normalized.id,
          assistantCode: normalized.assistantCode,
          conversationName: normalized.conversationName,
          preview: normalized.preview,
          size: normalized.sizeBytes,
          createdAt: toIso(Number(row.created_at || 0)),
          updatedAt: toIso(Number(row.updated_at || 0)),
          lastmod: toIso(Number(row.updated_at || 0)),
          deletedAt: row.deleted_at === null || row.deleted_at === void 0 ? null : toIso(Number(row.deleted_at || 0)),
          sessionData: normalized.sessionObject
        };
      }
      renameConversation(conversationId, conversationName) {
        this.ensureReady();
        const id = String(conversationId || "").trim();
        const name = String(conversationName || "").trim();
        if (!id) {
          throw new Error("conversationId is required");
        }
        if (!name) {
          throw new Error("conversationName is required");
        }
        const currentRows = this.runStatement(
          `
      SELECT id, assistant_code, conversation_name, preview, session_json,
             size_bytes, created_at, updated_at, deleted_at
      FROM conversations
      WHERE id = ?
      LIMIT 1;
      `,
          [id]
        );
        if (!currentRows.length) {
          throw new Error("Conversation not found.");
        }
        const current = this.normalizeConversationForSync({
          id: currentRows[0].id,
          assistantCode: currentRows[0].assistant_code,
          conversationName: name,
          preview: currentRows[0].preview,
          sessionJson: currentRows[0].session_json,
          sizeBytes: Number(currentRows[0].size_bytes || 0),
          createdAt: Number(currentRows[0].created_at || 0),
          updatedAt: Number(currentRows[0].updated_at || 0),
          deletedAt: currentRows[0].deleted_at === null || currentRows[0].deleted_at === void 0 ? null : Number(currentRows[0].deleted_at)
        });
        const updatedAt = nowMs();
        const sizeBytes = Buffer.byteLength(current.sessionJson, "utf8");
        this.runMutation(
          `
      UPDATE conversations
      SET conversation_name = ?,
          preview = ?,
          session_json = ?,
          size_bytes = ?,
          updated_at = ?,
          deleted_at = NULL
      WHERE id = ?;
      `,
          [current.conversationName, current.preview, current.sessionJson, sizeBytes, updatedAt, id]
        );
        this.enqueueOutbox("conversation", id, "upsert", {
          id,
          assistantCode: current.assistantCode,
          conversationName: current.conversationName,
          preview: current.preview,
          sessionJson: current.sessionJson,
          sizeBytes,
          createdAt: current.createdAt,
          updatedAt,
          deletedAt: null
        });
        this.scheduleSync(60);
        return {
          ok: true,
          conversationId: id,
          conversationName: name,
          updatedAt: toIso(updatedAt)
        };
      }
      deleteConversations(ids = []) {
        this.ensureReady();
        const normalized = Array.isArray(ids) ? ids.map((id) => String(id || "").trim()).filter(Boolean) : [];
        if (!normalized.length) {
          return { ok: true, deletedCount: 0 };
        }
        const deletedAt = nowMs();
        const placeholders = normalized.map(() => "?").join(", ");
        this.runMutation(
          `
      UPDATE conversations
      SET deleted_at = ?, updated_at = ?
      WHERE id IN (${placeholders});
      `,
          [deletedAt, deletedAt, ...normalized]
        );
        normalized.forEach((id) => {
          this.enqueueOutbox("conversation", id, "delete", {
            id,
            deletedAt
          });
        });
        this.scheduleSync(60);
        return {
          ok: true,
          deletedCount: normalized.length
        };
      }
      cleanConversations(days = 30) {
        this.ensureReady();
        const numDays = Number(days);
        if (!Number.isFinite(numDays) || numDays < 1) {
          throw new Error("days must be a positive number.");
        }
        const cutoff = nowMs() - Math.floor(numDays * 24 * 60 * 60 * 1e3);
        const rows = this.runStatement(
          `
      SELECT id
      FROM conversations
      WHERE deleted_at IS NULL AND updated_at < ?
      ORDER BY updated_at ASC;
      `,
          [cutoff]
        );
        const ids = rows.map((row) => String(row.id));
        if (!ids.length) {
          return { ok: true, deletedCount: 0, ids: [] };
        }
        this.deleteConversations(ids);
        return {
          ok: true,
          deletedCount: ids.length,
          ids
        };
      }
      async runLegacyMigrations() {
        if (this.getMeta("legacy_docs_migrated") !== "true") {
          await this.migrateLegacyDocs();
          this.setMeta("legacy_docs_migrated", "true");
        }
        if (this.getMeta("legacy_sessions_migrated") !== "true") {
          await this.migrateLegacySessions();
          this.setMeta("legacy_sessions_migrated", "true");
        }
      }
      async migrateLegacyDocs() {
        const sourcePath = String(this.legacyDocsPath || "").trim();
        if (!sourcePath || !fs2.existsSync(sourcePath)) {
          return;
        }
        let payload;
        try {
          const raw = await fsp.readFile(sourcePath, "utf8");
          payload = raw ? JSON.parse(raw) : {};
        } catch (_error) {
          payload = {};
        }
        if (!payload || typeof payload !== "object") {
          return;
        }
        this.withTransaction(() => {
          Object.entries(payload).forEach(([id, doc]) => {
            if (!id || !doc || typeof doc !== "object") return;
            const data = deepClone(doc.data || {});
            const parsed = parseRev(doc._rev);
            const revNo = parsed.revNo > 0 ? parsed.revNo : 1;
            const revTag = parsed.revTag || randomTag();
            this.runMutation(
              `
          INSERT OR REPLACE INTO docs (id, rev_no, rev_tag, data_json, updated_at, scope)
          VALUES (?, ?, ?, ?, ?, '');
          `,
              [id, revNo, revTag, JSON.stringify(data), nowMs()]
            );
          });
        });
        const configDoc = this.docGetSync("config");
        if (configDoc?.data) {
          this.updateConfiguredPostgresUrl(extractPostgresUrlFromConfigDoc(configDoc.data));
        }
      }
      resolveLegacyChatPath() {
        const localRows = this.runStatement(
          "SELECT data_json FROM docs WHERE id LIKE 'config_local_%' ORDER BY id ASC;"
        );
        for (const row of localRows) {
          const data = safeJsonParse(row.data_json, {});
          const localPath = String(data?.localChatPath || "").trim();
          if (localPath) return localPath;
        }
        const configDoc = this.docGetSync("config");
        const fallbackPath = String(configDoc?.data?.config?.webdav?.localChatPath || "").trim();
        if (fallbackPath) return fallbackPath;
        return "";
      }
      async migrateLegacySessions() {
        const localPath = this.resolveLegacyChatPath();
        if (!localPath) return;
        try {
          const stat = await fsp.stat(localPath);
          if (!stat.isDirectory()) return;
        } catch (_error) {
          return;
        }
        let files = [];
        try {
          files = await fsp.readdir(localPath);
        } catch (_error) {
          return;
        }
        for (const fileName of files) {
          if (!String(fileName).toLowerCase().endsWith(".json")) continue;
          const filePath = path2.join(localPath, fileName);
          let raw = "";
          let stat = null;
          try {
            raw = await fsp.readFile(filePath, "utf8");
            stat = await fsp.stat(filePath);
          } catch (_error) {
            continue;
          }
          const sessionObject = safeJsonParse(raw, null);
          if (!isSessionPayload(sessionObject)) continue;
          const assistantCode = String(sessionObject?.CODE || "AI");
          const conversationName = fileName.replace(/\.json$/i, "") || `Legacy-${assistantCode}`;
          const preview = extractConversationPreview(sessionObject);
          const conversationId = `legacy:${stableHash(filePath)}`;
          const createdAt = Number(stat?.birthtimeMs || stat?.mtimeMs || nowMs());
          const updatedAt = Number(stat?.mtimeMs || nowMs());
          const sizeBytes = Buffer.byteLength(raw, "utf8");
          const exists = this.getConversation(conversationId);
          if (exists) continue;
          this.runMutation(
            `
        INSERT OR REPLACE INTO conversations (
          id, assistant_code, conversation_name, preview,
          session_json, size_bytes, created_at, updated_at, deleted_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL);
        `,
            [
              conversationId,
              assistantCode,
              conversationName,
              preview,
              raw,
              sizeBytes,
              createdAt,
              updatedAt
            ]
          );
        }
      }
    };
    module2.exports = {
      StorageService: StorageService2,
      testPostgresConnection: testPostgresConnection2,
      maskPostgresUrl,
      normalizePostgresUrl
    };
  }
});

// electron-src/main.ts
var {
  app,
  BrowserWindow,
  dialog,
  globalShortcut,
  ipcMain,
  Notification,
  screen,
  session,
  nativeTheme
} = require("electron");
var fs = require("fs");
var net = require("net");
var path = require("path");
var { pathToFileURL } = require("url");
var {
  StorageService,
  testPostgresConnection
} = require_storage_service();
var managedWindows = /* @__PURE__ */ new Map();
var mainWindow = null;
var launcherWindow = null;
var launcherHotkey = null;
var storageService = null;
var isQuitting = false;
var DEV_MAIN_URL = String(process.env.ANYWHERE_DEV_MAIN_URL || "").trim();
var DEV_PRELOAD_PATH = String(process.env.ANYWHERE_DEV_PRELOAD_PATH || "").trim();
var IS_RUNTIME_DEV_SERVER = DEV_MAIN_URL.length > 0;
var DEFAULT_LAUNCHER_SETTINGS = {
  launcherEnabled: true,
  launcherHotkey: "CommandOrControl+Shift+Space"
};
var SUPPORTED_PROMPT_TYPES = /* @__PURE__ */ new Set(["general", "over", "img", "files"]);
var LAUNCHER_WIDTH = 640;
var LAUNCHER_HEIGHT = 56;
var LAUNCHER_MAX_HEIGHT = 440;
var DEEPSEEK_PROXY_HOST = "127.0.0.1";
var DEEPSEEK_PROXY_PREFERRED_PORT = 5001;
var DEEPSEEK_PROXY_READY_TIMEOUT_MS = 12e3;
var DEEPSEEK_LOGIN_URL = "https://chat.deepseek.com";
var DEEPSEEK_LOGIN_PARTITION = "persist:deepseek-login";
var DEEPSEEK_LOGIN_ACCEPT_LANGUAGE = "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7";
var STORAGE_CONVERSATIONS_CHANGED_CHANNEL = "storage:conversations-changed";
var deepSeekProxyState = {
  started: false,
  baseUrl: "",
  port: 0,
  startPromise: null,
  lastError: "",
  moduleEntryPath: ""
};
var deepSeekLoginPromise = null;
var deepSeekLoginHeadersPatched = false;
function extractDeepSeekUserToken(rawToken) {
  const source = String(rawToken || "").trim();
  if (!source) return "";
  try {
    const parsed = JSON.parse(source);
    if (typeof parsed === "string") {
      return extractDeepSeekUserToken(parsed);
    }
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const value = parsed.value;
      if (typeof value === "string") {
        return value.trim();
      }
      if (value !== void 0 && value !== null) {
        return String(value).trim();
      }
    }
  } catch (_error) {
  }
  return source;
}
function getDeepSeekLoginUserAgent() {
  let platformSection = "X11; Linux x86_64";
  if (process.platform === "darwin") {
    platformSection = "Macintosh; Intel Mac OS X 10_15_7";
  } else if (process.platform === "win32") {
    platformSection = "Windows NT 10.0; Win64; x64";
  }
  const chromeVersion = String(process.versions.chrome || "124.0.0.0");
  return `Mozilla/5.0 (${platformSection}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36`;
}
function getDeepSeekSecChUaPlatform() {
  if (process.platform === "darwin") return '"macOS"';
  if (process.platform === "win32") return '"Windows"';
  return '"Linux"';
}
function setHeaderCaseInsensitive(headers, name, value) {
  const existingKey = Object.keys(headers).find(
    (key) => String(key).toLowerCase() === name.toLowerCase()
  );
  if (existingKey && existingKey !== name) {
    delete headers[existingKey];
  }
  headers[name] = value;
}
function deleteHeaderCaseInsensitive(headers, name) {
  const existingKey = Object.keys(headers).find(
    (key) => String(key).toLowerCase() === name.toLowerCase()
  );
  if (existingKey) {
    delete headers[existingKey];
  }
}
function installDeepSeekLoginHeaderPatch(targetSession, userAgent) {
  if (deepSeekLoginHeadersPatched) return;
  deepSeekLoginHeadersPatched = true;
  targetSession.webRequest.onBeforeSendHeaders(
    { urls: ["https://chat.deepseek.com/*"] },
    (details, callback) => {
      const requestHeaders = { ...details.requestHeaders || {} };
      setHeaderCaseInsensitive(requestHeaders, "User-Agent", userAgent);
      setHeaderCaseInsensitive(requestHeaders, "Accept-Language", DEEPSEEK_LOGIN_ACCEPT_LANGUAGE);
      setHeaderCaseInsensitive(
        requestHeaders,
        "Sec-CH-UA",
        '"Not A(Brand";v="99", "Google Chrome";v="124", "Chromium";v="124"'
      );
      setHeaderCaseInsensitive(requestHeaders, "Sec-CH-UA-Mobile", "?0");
      setHeaderCaseInsensitive(requestHeaders, "Sec-CH-UA-Platform", getDeepSeekSecChUaPlatform());
      deleteHeaderCaseInsensitive(requestHeaders, "X-Requested-With");
      callback({ cancel: false, requestHeaders });
    }
  );
}
function resolveAppFile(...parts) {
  return path.join(app.getAppPath(), ...parts);
}
function resolveMainPreloadPath() {
  if (!DEV_PRELOAD_PATH) return resolveAppFile("runtime", "preload.js");
  return path.isAbsolute(DEV_PRELOAD_PATH) ? DEV_PRELOAD_PATH : path.resolve(app.getAppPath(), DEV_PRELOAD_PATH);
}
function resolveDeepSeekLoginPreloadPath() {
  return resolveAppFile("electron", "deepseek_login_preload.js");
}
function resolveMainEntryUrl() {
  if (IS_RUNTIME_DEV_SERVER) return DEV_MAIN_URL;
  return pathToFileURL(resolveAppFile("runtime", "main", "index.html")).toString();
}
function resolveLauncherEntryUrl() {
  if (IS_RUNTIME_DEV_SERVER) {
    try {
      return new URL("launcher.html", DEV_MAIN_URL).toString();
    } catch (_error) {
      const base = DEV_MAIN_URL.endsWith("/") ? DEV_MAIN_URL : `${DEV_MAIN_URL}/`;
      return `${base}launcher.html`;
    }
  }
  return pathToFileURL(resolveAppFile("runtime", "main", "launcher.html")).toString();
}
function normalizeWebPreferences(webPreferences = {}, baseDir) {
  const normalized = { ...webPreferences };
  if (normalized.preload) {
    normalized.preload = path.isAbsolute(normalized.preload) ? normalized.preload : path.resolve(baseDir, normalized.preload);
  }
  normalized.contextIsolation = false;
  normalized.sandbox = false;
  normalized.nodeIntegration = false;
  return normalized;
}
function toLoadUrl(entryPath, baseDir) {
  const raw = String(entryPath || "");
  if (/^https?:\/\//i.test(raw) || /^file:\/\//i.test(raw)) {
    return raw;
  }
  const [filePart, queryPart] = raw.split("?");
  const absolutePath = path.isAbsolute(filePart) ? filePart : path.resolve(baseDir, filePart);
  const fileUrl = pathToFileURL(absolutePath);
  if (queryPart) fileUrl.search = queryPart;
  return fileUrl.toString();
}
function normalizePromptType(rawType) {
  const value = String(rawType || "general").toLowerCase();
  if (value === "text") return "over";
  if (value === "image") return "img";
  if (value === "file") return "files";
  return SUPPORTED_PROMPT_TYPES.has(value) ? value : "general";
}
function getShimDataRoot() {
  return path.join(app.getPath("userData"), "utools-shim");
}
function getShimDocumentsPath() {
  return path.join(getShimDataRoot(), "documents.json");
}
function readShimDocuments() {
  const docsPath = getShimDocumentsPath();
  if (!fs.existsSync(docsPath)) return {};
  try {
    const raw = fs.readFileSync(docsPath, "utf8");
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    console.error("[Launcher] Failed to read shim documents:", error);
    return {};
  }
}
function getStorageServiceInstance() {
  if (!storageService || !storageService.isReady()) {
    throw new Error("Storage service is not initialized.");
  }
  return storageService;
}
async function ensureStorageServiceReady() {
  if (storageService && storageService.isReady()) return storageService;
  if (!storageService) {
    storageService = new StorageService({
      dataRoot: getShimDataRoot(),
      legacyDocsPath: getShimDocumentsPath(),
      onSyncSummary: (summary = {}) => {
        if (summary?.ok && Number(summary?.applied || 0) > 0) {
          notifyConversationsChanged({
            source: "sync-pull",
            pulled: Number(summary.pulled || 0),
            applied: Number(summary.applied || 0),
            staleSkipped: Number(summary.staleSkipped || 0)
          });
        }
      }
    });
  }
  await storageService.init();
  return storageService;
}
function notifyConversationsChanged(payload = {}) {
  const message = {
    at: (/* @__PURE__ */ new Date()).toISOString(),
    ...payload
  };
  const targets = [];
  if (mainWindow && !mainWindow.isDestroyed()) {
    targets.push(mainWindow.webContents);
  }
  managedWindows.forEach((win) => {
    if (win && !win.isDestroyed()) {
      targets.push(win.webContents);
    }
  });
  const seen = /* @__PURE__ */ new Set();
  targets.forEach((webContents) => {
    if (!webContents || webContents.isDestroyed()) return;
    if (seen.has(webContents.id)) return;
    seen.add(webContents.id);
    webContents.send(STORAGE_CONVERSATIONS_CHANGED_CHANNEL, message);
  });
}
function readStoredDocData(docId) {
  try {
    if (storageService && storageService.isReady()) {
      const doc = storageService.docGetSync(docId);
      if (doc && doc.data && typeof doc.data === "object") {
        return doc.data;
      }
    }
  } catch (error) {
    console.warn(`[Storage] Failed to read doc "${docId}" from storage service:`, error);
  }
  const docs = readShimDocuments();
  const docData = docs?.[docId]?.data;
  return docData && typeof docData === "object" ? docData : {};
}
function readStoredLauncherSettings() {
  const sharedConfig = readStoredDocData("config")?.config || {};
  const launcherEnabled = sharedConfig.launcherEnabled === void 0 ? DEFAULT_LAUNCHER_SETTINGS.launcherEnabled : !!sharedConfig.launcherEnabled;
  const launcherHotkeyValue = typeof sharedConfig.launcherHotkey === "string" ? sharedConfig.launcherHotkey.trim() : "";
  const normalizedHotkey = launcherHotkeyValue || DEFAULT_LAUNCHER_SETTINGS.launcherHotkey;
  return { launcherEnabled, launcherHotkey: normalizedHotkey };
}
function readStoredThemeSettings() {
  return readStoredDocData("config")?.config || {};
}
function resolveThemeSource(settings = {}) {
  const mode = typeof settings.themeMode === "string" ? settings.themeMode.trim().toLowerCase() : "";
  if (mode === "dark" || mode === "light" || mode === "system") {
    return mode;
  }
  if (typeof settings.isDarkMode === "boolean") {
    return settings.isDarkMode ? "dark" : "light";
  }
  return "system";
}
function applyNativeThemeSource(settings = {}) {
  if (process.platform !== "darwin") return "system";
  const source = resolveThemeSource(settings);
  if (nativeTheme.themeSource !== source) {
    nativeTheme.themeSource = source;
  }
  return source;
}
function readStoredPrompts() {
  const promptsData = readStoredDocData("prompts");
  if (!promptsData || typeof promptsData !== "object") return [];
  return Object.entries(promptsData).filter(
    ([code, prompt]) => code && prompt && typeof prompt === "object" && prompt.enable !== false
  ).map(([code, prompt]) => ({
    code,
    prompt: typeof prompt.prompt === "string" ? prompt.prompt : "",
    type: normalizePromptType(prompt.type),
    showMode: typeof prompt.showMode === "string" ? prompt.showMode : "window",
    matchRegex: typeof prompt.matchRegex === "string" ? prompt.matchRegex : "",
    icon: typeof prompt.icon === "string" ? prompt.icon : ""
  })).sort((a, b) => a.code.localeCompare(b.code));
}
function normalizeLauncherHotkey(rawHotkey) {
  if (typeof rawHotkey !== "string") return DEFAULT_LAUNCHER_SETTINGS.launcherHotkey;
  const trimmed = rawHotkey.trim();
  return trimmed || DEFAULT_LAUNCHER_SETTINGS.launcherHotkey;
}
function registerManagedWindow(win) {
  managedWindows.set(win.id, win);
  win.on("closed", () => {
    managedWindows.delete(win.id);
  });
}
function applyMacVibrancy(win, options = {}) {
  if (process.platform !== "darwin") return;
  if (!win || win.isDestroyed()) return;
  const material = typeof options.vibrancy === "string" ? options.vibrancy.trim() : "";
  if (!material) return;
  try {
    if (typeof win.setVisualEffectState === "function") {
      const visualEffectState = typeof options.visualEffectState === "string" ? options.visualEffectState : "active";
      win.setVisualEffectState(visualEffectState);
    }
    const duration = Number(options.animationDuration);
    if (Number.isFinite(duration) && duration >= 0) {
      win.setVibrancy(material, { animationDuration: Math.round(duration) });
      return;
    }
    win.setVibrancy(material);
  } catch (error) {
    console.warn(`[Vibrancy] Failed to apply vibrancy "${material}":`, error);
  }
}
function getLauncherBounds() {
  const width = LAUNCHER_WIDTH;
  const height = LAUNCHER_HEIGHT;
  const cursor = screen.getCursorScreenPoint();
  const display = screen.getDisplayNearestPoint(cursor) || screen.getPrimaryDisplay();
  const workArea = display.workArea || display.bounds;
  const padding = 12;
  const x = Math.round(workArea.x + (workArea.width - width) / 2);
  const preferredY = Math.round(workArea.y + Math.max(96, workArea.height * 0.28));
  const maxY = workArea.y + workArea.height - height - padding;
  const y = Math.max(workArea.y + padding, Math.min(preferredY, maxY));
  return { x, y, width, height };
}
function createLauncherWindow() {
  if (launcherWindow && !launcherWindow.isDestroyed()) return launcherWindow;
  const launcherPreload = resolveAppFile("electron", "launcher_preload.js");
  launcherWindow = new BrowserWindow({
    width: LAUNCHER_WIDTH,
    height: LAUNCHER_HEIGHT,
    show: false,
    frame: false,
    transparent: true,
    hasShadow: false,
    resizable: false,
    minimizable: false,
    maximizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    backgroundColor: "#00000000",
    roundedCorners: false,
    webPreferences: {
      preload: launcherPreload,
      contextIsolation: false,
      sandbox: false,
      nodeIntegration: false
    }
  });
  launcherWindow.on("blur", () => {
    if (launcherWindow && !launcherWindow.isDestroyed()) {
      launcherWindow.hide();
    }
  });
  launcherWindow.on("close", (event) => {
    if (isQuitting) return;
    event.preventDefault();
    launcherWindow.hide();
  });
  launcherWindow.on("closed", () => {
    launcherWindow = null;
  });
  launcherWindow.loadURL(resolveLauncherEntryUrl());
  return launcherWindow;
}
function hideLauncherWindow() {
  if (!launcherWindow || launcherWindow.isDestroyed()) return;
  launcherWindow.hide();
}
function showLauncherWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  const launcher = createLauncherWindow();
  const bounds = getLauncherBounds();
  launcher.setBounds(bounds, false);
  launcher.show();
  launcher.focus();
  if (launcher.webContents.isLoading()) {
    launcher.webContents.once("did-finish-load", () => {
      if (!launcher.isDestroyed()) {
        launcher.webContents.send("launcher:refresh");
        launcher.webContents.send("launcher:focus-input");
      }
    });
    return;
  }
  launcher.webContents.send("launcher:refresh");
  launcher.webContents.send("launcher:focus-input");
}
function toggleLauncherWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  if (launcherWindow && !launcherWindow.isDestroyed() && launcherWindow.isVisible()) {
    hideLauncherWindow();
    return;
  }
  showLauncherWindow();
}
function registerLauncherHotkey(rawSettings = {}) {
  const launcherEnabled = rawSettings.launcherEnabled === void 0 ? DEFAULT_LAUNCHER_SETTINGS.launcherEnabled : !!rawSettings.launcherEnabled;
  const normalizedHotkey = normalizeLauncherHotkey(rawSettings.launcherHotkey);
  const previousHotkey = launcherHotkey;
  if (!launcherEnabled) {
    if (previousHotkey && globalShortcut.isRegistered(previousHotkey)) {
      globalShortcut.unregister(previousHotkey);
    }
    launcherHotkey = null;
    hideLauncherWindow();
    return { ok: true, launcherEnabled, launcherHotkey: normalizedHotkey, activeHotkey: null };
  }
  if (previousHotkey && previousHotkey === normalizedHotkey && globalShortcut.isRegistered(previousHotkey)) {
    return {
      ok: true,
      launcherEnabled,
      launcherHotkey: normalizedHotkey,
      activeHotkey: previousHotkey
    };
  }
  if (previousHotkey && globalShortcut.isRegistered(previousHotkey)) {
    globalShortcut.unregister(previousHotkey);
  }
  let registered = false;
  let registerError = "";
  try {
    registered = globalShortcut.register(normalizedHotkey, () => {
      toggleLauncherWindow();
    });
  } catch (error) {
    registerError = String(error?.message || error);
  }
  if (registered) {
    launcherHotkey = normalizedHotkey;
    return {
      ok: true,
      launcherEnabled,
      launcherHotkey: normalizedHotkey,
      activeHotkey: normalizedHotkey
    };
  }
  launcherHotkey = null;
  if (previousHotkey && previousHotkey !== normalizedHotkey) {
    try {
      const restored = globalShortcut.register(previousHotkey, () => {
        toggleLauncherWindow();
      });
      if (restored) {
        launcherHotkey = previousHotkey;
      }
    } catch (_error) {
    }
  }
  const fallbackMsg = registerError || `Unable to register global shortcut "${normalizedHotkey}".`;
  const recoveryMsg = launcherHotkey ? ` Keeping previous shortcut "${launcherHotkey}".` : "";
  return {
    ok: false,
    launcherEnabled,
    launcherHotkey: normalizedHotkey,
    activeHotkey: launcherHotkey,
    error: `${fallbackMsg}${recoveryMsg}`
  };
}
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function getDeepSeekProxyDataDir() {
  const dir = path.join(app.getPath("userData"), "deepseek-api");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}
function isPortAvailable(port, host = DEEPSEEK_PROXY_HOST) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.once("error", () => {
      resolve(false);
    });
    server.once("listening", () => {
      server.close(() => resolve(true));
    });
    try {
      server.listen(port, host);
    } catch (_error) {
      resolve(false);
    }
  });
}
function getFreePort(host = DEEPSEEK_PROXY_HOST) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.once("error", (error) => {
      reject(error);
    });
    server.once("listening", () => {
      const addressInfo = server.address();
      const port = addressInfo && typeof addressInfo === "object" ? addressInfo.port : 0;
      server.close(() => {
        if (port > 0) {
          resolve(port);
        } else {
          reject(new Error("Failed to allocate free port."));
        }
      });
    });
    server.listen(0, host);
  });
}
function resolveDeepSeekModuleEntryPath() {
  if (deepSeekProxyState.moduleEntryPath) {
    return deepSeekProxyState.moduleEntryPath;
  }
  const packageJsonPath = require.resolve("@ziuchen/deepseek-api/package.json");
  const packageDir = path.dirname(packageJsonPath);
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  const mainEntry = typeof packageJson.main === "string" && packageJson.main.trim() ? packageJson.main.trim() : "";
  const candidates = [
    path.join(packageDir, "dist", "index.mjs"),
    mainEntry ? path.join(packageDir, mainEntry) : "",
    path.join(packageDir, "dist", "index.js")
  ].filter(Boolean);
  const entryPath = candidates.find((candidate) => fs.existsSync(candidate));
  if (!entryPath) {
    throw new Error("Unable to resolve @ziuchen/deepseek-api entry file.");
  }
  deepSeekProxyState.moduleEntryPath = entryPath;
  return entryPath;
}
async function isDeepSeekProxyReady(baseOrigin) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 1500);
  try {
    const response = await fetch(`${baseOrigin}/v1/models`, {
      method: "GET",
      signal: controller.signal
    });
    return response.ok;
  } catch (_error) {
    return false;
  } finally {
    clearTimeout(timer);
  }
}
async function waitForDeepSeekProxyReady(baseOrigin, timeoutMs = DEEPSEEK_PROXY_READY_TIMEOUT_MS) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (await isDeepSeekProxyReady(baseOrigin)) {
      return true;
    }
    await delay(250);
  }
  return false;
}
async function startDeepSeekProxy() {
  const preferredAvailable = await isPortAvailable(DEEPSEEK_PROXY_PREFERRED_PORT);
  const selectedPort = preferredAvailable ? DEEPSEEK_PROXY_PREFERRED_PORT : await getFreePort(DEEPSEEK_PROXY_HOST);
  const baseOrigin = `http://${DEEPSEEK_PROXY_HOST}:${selectedPort}`;
  process.env.LISTEN_HOST = DEEPSEEK_PROXY_HOST;
  process.env.LISTEN_PORT = String(selectedPort);
  process.env.DATA_DIR = getDeepSeekProxyDataDir();
  const entryPath = resolveDeepSeekModuleEntryPath();
  await import(pathToFileURL(entryPath).toString());
  const isReady = await waitForDeepSeekProxyReady(baseOrigin);
  if (!isReady) {
    throw new Error("DeepSeek proxy did not become ready in time.");
  }
  deepSeekProxyState.started = true;
  deepSeekProxyState.baseUrl = `${baseOrigin}/v1`;
  deepSeekProxyState.port = selectedPort;
  deepSeekProxyState.lastError = "";
  return {
    ok: true,
    baseUrl: deepSeekProxyState.baseUrl,
    port: deepSeekProxyState.port
  };
}
async function ensureDeepSeekProxy() {
  if (deepSeekProxyState.started && deepSeekProxyState.baseUrl) {
    return {
      ok: true,
      baseUrl: deepSeekProxyState.baseUrl,
      port: deepSeekProxyState.port
    };
  }
  if (deepSeekProxyState.startPromise) {
    return deepSeekProxyState.startPromise;
  }
  deepSeekProxyState.startPromise = (async () => {
    try {
      return await startDeepSeekProxy();
    } catch (error) {
      const errorText = String(error?.message || error);
      deepSeekProxyState.started = false;
      deepSeekProxyState.baseUrl = "";
      deepSeekProxyState.port = 0;
      deepSeekProxyState.lastError = errorText;
      return {
        ok: false,
        error: errorText
      };
    } finally {
      deepSeekProxyState.startPromise = null;
    }
  })();
  return deepSeekProxyState.startPromise;
}
function createDeepSeekLoginWindow(owner) {
  const userAgent = getDeepSeekLoginUserAgent();
  const loginSession = session.fromPartition(DEEPSEEK_LOGIN_PARTITION);
  installDeepSeekLoginHeaderPatch(loginSession, userAgent);
  const loginPreloadPath = resolveDeepSeekLoginPreloadPath();
  const loginWindow = new BrowserWindow({
    width: 440,
    height: 760,
    minWidth: 400,
    minHeight: 640,
    show: true,
    autoHideMenuBar: true,
    parent: owner,
    modal: false,
    title: "DeepSeek Login",
    webPreferences: {
      preload: fs.existsSync(loginPreloadPath) ? loginPreloadPath : void 0,
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      partition: DEEPSEEK_LOGIN_PARTITION
    }
  });
  loginWindow.webContents.setUserAgent(userAgent);
  loginWindow.loadURL(DEEPSEEK_LOGIN_URL, { userAgent });
  return loginWindow;
}
function loginDeepSeek(owner) {
  if (deepSeekLoginPromise) {
    return deepSeekLoginPromise;
  }
  deepSeekLoginPromise = new Promise((resolve) => {
    const loginWindow = createDeepSeekLoginWindow(owner);
    let settled = false;
    let pollTimer = null;
    let latestToken = "";
    let allowClose = false;
    let closeGuardInProgress = false;
    const cleanup = () => {
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
    };
    const settle = (payload) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(payload);
      if (!loginWindow.isDestroyed()) {
        loginWindow.close();
      }
    };
    const tryReadUserToken = async () => {
      if (settled || loginWindow.isDestroyed()) return;
      try {
        const rawToken = await loginWindow.webContents.executeJavaScript(
          `(() => {
            try {
              const raw = localStorage.getItem('userToken');
              return typeof raw === 'string' ? raw.trim() : '';
            } catch (_error) {
              return '';
            }
          })()`,
          true
        );
        const parsedToken = extractDeepSeekUserToken(rawToken);
        if (parsedToken) {
          latestToken = parsedToken;
        }
      } catch (_error) {
      }
    };
    pollTimer = setInterval(() => {
      tryReadUserToken().catch(() => {
      });
    }, 1200);
    loginWindow.webContents.on("did-finish-load", () => {
      tryReadUserToken().catch(() => {
      });
    });
    loginWindow.on("close", (event) => {
      if (allowClose || settled) return;
      event.preventDefault();
      if (closeGuardInProgress) return;
      closeGuardInProgress = true;
      tryReadUserToken().catch(() => {
      }).finally(() => {
        allowClose = true;
        closeGuardInProgress = false;
        if (!loginWindow.isDestroyed()) {
          loginWindow.close();
        }
      });
    });
    loginWindow.on("closed", () => {
      if (!settled) {
        if (latestToken) {
          settle({ ok: true, userToken: latestToken });
        } else {
          settled = true;
          cleanup();
          resolve({ ok: false, cancelled: true });
        }
      }
    });
  }).finally(() => {
    deepSeekLoginPromise = null;
  });
  return deepSeekLoginPromise;
}
function createMainWindow() {
  const preloadPath = resolveMainPreloadPath();
  const isMac = process.platform === "darwin";
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 820,
    minWidth: 800,
    minHeight: 600,
    show: false,
    backgroundColor: isMac ? "#00000000" : "#f7f7f5",
    autoHideMenuBar: true,
    title: isMac ? "" : "Sanft",
    ...isMac ? {
      titleBarStyle: "hiddenInset",
      transparent: true
    } : {},
    webPreferences: {
      preload: preloadPath,
      contextIsolation: false,
      sandbox: false,
      nodeIntegration: false
    }
  });
  mainWindow.on("closed", () => {
    if (launcherWindow && !launcherWindow.isDestroyed()) {
      launcherWindow.destroy();
      launcherWindow = null;
    }
    mainWindow = null;
  });
  mainWindow.once("ready-to-show", () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    mainWindow.show();
  });
  mainWindow.loadURL(resolveMainEntryUrl());
  applyMacVibrancy(mainWindow, {
    vibrancy: "sidebar",
    visualEffectState: "active",
    animationDuration: 120
  });
}
function ensureBuildArtifacts() {
  if (IS_RUNTIME_DEV_SERVER) {
    const preloadPath = resolveMainPreloadPath();
    const preloadDir = path.dirname(preloadPath);
    const requiredPaths2 = [
      preloadPath,
      path.join(preloadDir, "window_preload.js"),
      path.join(preloadDir, "fast_window_preload.js"),
      path.join(preloadDir, "runtime", "file_runtime.js"),
      path.join(preloadDir, "runtime", "mcp_runtime.js"),
      path.join(preloadDir, "runtime", "skill_runtime.js")
    ];
    const missing2 = requiredPaths2.filter((file) => !fs.existsSync(file));
    if (missing2.length === 0) return;
    const message2 = [
      "Development preload resources are missing.",
      "Run `./dev.sh` so backend watch can generate preload files.",
      "",
      ...missing2.map((item) => `- ${item}`)
    ].join("\n");
    dialog.showErrorBox("Sanft Dev Resources Missing", message2);
    app.quit();
    return;
  }
  const requiredPaths = [
    resolveAppFile("electron", "launcher_preload.js"),
    resolveAppFile("electron", "deepseek_login_preload.js"),
    resolveAppFile("runtime", "main", "index.html"),
    resolveAppFile("runtime", "main", "launcher.html"),
    resolveAppFile("runtime", "preload.js"),
    resolveAppFile("runtime", "window_preload.js"),
    resolveAppFile("runtime", "fast_window_preload.js"),
    resolveAppFile("runtime", "runtime", "file_runtime.js"),
    resolveAppFile("runtime", "runtime", "mcp_runtime.js"),
    resolveAppFile("runtime", "runtime", "skill_runtime.js")
  ];
  const missing = requiredPaths.filter((file) => !fs.existsSync(file));
  if (missing.length === 0) return;
  const message = [
    "Desktop resources are missing.",
    "Run `pnpm build` at project root before launching Electron.",
    "",
    ...missing.map((item) => `- ${item}`)
  ].join("\n");
  dialog.showErrorBox("Sanft Build Missing", message);
  app.quit();
}
ipcMain.on("utools:get-user-data-path", (event) => {
  event.returnValue = path.join(app.getPath("userData"), "utools-shim");
});
ipcMain.on("utools:is-dev", (event) => {
  event.returnValue = !app.isPackaged;
});
ipcMain.on("utools:get-primary-display", (event) => {
  event.returnValue = screen.getPrimaryDisplay();
});
ipcMain.on("utools:get-display-nearest-point", (event, point) => {
  const fallback = screen.getPrimaryDisplay();
  try {
    event.returnValue = screen.getDisplayNearestPoint(point || { x: 0, y: 0 });
  } catch (_error) {
    event.returnValue = fallback;
  }
});
ipcMain.on("utools:get-cursor-screen-point", (event) => {
  event.returnValue = screen.getCursorScreenPoint();
});
ipcMain.on("utools:sync-native-theme", (_event, payload = {}) => {
  if (process.platform !== "darwin") return;
  applyNativeThemeSource(payload);
  if (mainWindow && !mainWindow.isDestroyed()) {
    applyMacVibrancy(mainWindow, {
      vibrancy: "sidebar",
      visualEffectState: "active",
      animationDuration: 0
    });
  }
  if (launcherWindow && !launcherWindow.isDestroyed()) {
    applyMacVibrancy(launcherWindow, {
      vibrancy: "sidebar",
      visualEffectState: "active",
      animationDuration: 0
    });
  }
});
ipcMain.on("utools:create-browser-window", (event, payload = {}) => {
  const entryPath = payload.entryPath || "";
  const rawOptions = payload.options || {};
  const baseDir = payload.baseDir && path.isAbsolute(payload.baseDir) ? payload.baseDir : resolveAppFile("runtime");
  const normalizedOptions = {
    ...rawOptions,
    webPreferences: normalizeWebPreferences(rawOptions.webPreferences || {}, baseDir)
  };
  const windowVibrancy = typeof normalizedOptions.macOSVibrancy === "string" ? normalizedOptions.macOSVibrancy : typeof normalizedOptions.vibrancy === "string" ? normalizedOptions.vibrancy : "";
  const windowVisualEffectState = typeof normalizedOptions.macOSVisualEffectState === "string" ? normalizedOptions.macOSVisualEffectState : "active";
  const windowVibrancyAnimationDuration = normalizedOptions.macOSVibrancyAnimationDuration;
  delete normalizedOptions.macOSVibrancy;
  delete normalizedOptions.macOSVisualEffectState;
  delete normalizedOptions.macOSVibrancyAnimationDuration;
  delete normalizedOptions.vibrancy;
  const win = new BrowserWindow(normalizedOptions);
  applyMacVibrancy(win, {
    vibrancy: windowVibrancy,
    visualEffectState: windowVisualEffectState,
    animationDuration: windowVibrancyAnimationDuration
  });
  registerManagedWindow(win);
  const readyChannel = `utools:window-ready:${win.id}`;
  win.webContents.once("did-finish-load", () => {
    if (!event.sender.isDestroyed()) {
      event.sender.send(readyChannel);
    }
  });
  const url = toLoadUrl(entryPath, baseDir);
  win.loadURL(url);
  event.returnValue = win.id;
});
ipcMain.on("utools:window-query", (event, payload = {}) => {
  const id = Number(payload.id);
  const query = payload.query;
  const win = managedWindows.get(id);
  if (!win || win.isDestroyed()) {
    event.returnValue = query === "isDestroyed";
    return;
  }
  switch (query) {
    case "isDestroyed":
      event.returnValue = win.isDestroyed();
      break;
    case "isAlwaysOnTop":
      event.returnValue = win.isAlwaysOnTop();
      break;
    case "isMaximized":
      event.returnValue = win.isMaximized();
      break;
    default:
      event.returnValue = null;
      break;
  }
});
ipcMain.on("utools:window-action", (_event, payload = {}) => {
  const id = Number(payload.id);
  const action = payload.action;
  const arg = payload.arg;
  const win = managedWindows.get(id);
  if (!win || win.isDestroyed()) return;
  switch (action) {
    case "show":
      win.show();
      break;
    case "hide":
      win.hide();
      break;
    case "close":
      win.close();
      break;
    case "minimize":
      win.minimize();
      break;
    case "maximize":
      if (!win.isMaximized()) win.maximize();
      break;
    case "unmaximize":
      if (win.isMaximized()) win.unmaximize();
      break;
    case "setAlwaysOnTop":
      win.setAlwaysOnTop(!!arg);
      break;
    default:
      break;
  }
});
ipcMain.on("utools:window-webcontents-send", (_event, payload = {}) => {
  const id = Number(payload.id);
  const channel = payload.channel;
  const data = payload.data;
  const win = managedWindows.get(id);
  if (!win || win.isDestroyed()) return;
  win.webContents.send(channel, data);
});
ipcMain.on("utools:window-open-devtools", (_event, payload = {}) => {
  const id = Number(payload.id);
  const options = payload.options || { mode: "detach" };
  const win = managedWindows.get(id);
  if (!win || win.isDestroyed()) return;
  win.webContents.openDevTools(options);
});
ipcMain.on("utools:show-save-dialog", (event, options = {}) => {
  const owner = BrowserWindow.fromWebContents(event.sender) || mainWindow || void 0;
  event.returnValue = dialog.showSaveDialogSync(owner, options);
});
ipcMain.on("utools:show-open-dialog", (event, options = {}) => {
  const owner = BrowserWindow.fromWebContents(event.sender) || mainWindow || void 0;
  event.returnValue = dialog.showOpenDialogSync(owner, options);
});
ipcMain.on("utools:show-notification", (_event, payload = {}) => {
  const title = payload.title || "Sanft";
  const body = payload.body || "";
  if (Notification.isSupported()) {
    new Notification({ title, body }).show();
  }
});
ipcMain.on("utools:main-window-action", (_event, payload = {}) => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  const action = payload.action;
  if (action === "hide") {
    mainWindow.hide();
  } else if (action === "show") {
    mainWindow.show();
    mainWindow.focus();
  } else if (action === "close") {
    mainWindow.close();
  } else if (action === "minimize") {
    mainWindow.minimize();
  } else if (action === "maximize") {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});
ipcMain.on("utools:send-to-parent", (event, payload = {}) => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  if (event.sender.id === mainWindow.webContents.id) return;
  const channel = payload.channel;
  const data = payload.payload;
  mainWindow.webContents.send(channel, data);
});
ipcMain.on("storage:doc-get-sync", (event, docId) => {
  try {
    const service = getStorageServiceInstance();
    event.returnValue = service.docGetSync(docId);
  } catch (error) {
    console.error("[Storage] storage:doc-get-sync failed:", error);
    event.returnValue = null;
  }
});
ipcMain.on("storage:doc-put-sync", (event, doc) => {
  try {
    const service = getStorageServiceInstance();
    event.returnValue = service.docPutSync(doc);
  } catch (error) {
    console.error("[Storage] storage:doc-put-sync failed:", error);
    event.returnValue = {
      ok: false,
      error: true,
      name: "storage_error",
      message: String(error?.message || error)
    };
  }
});
ipcMain.on("storage:doc-remove-sync", (event, docId) => {
  try {
    const service = getStorageServiceInstance();
    event.returnValue = service.docRemoveSync(docId);
  } catch (error) {
    console.error("[Storage] storage:doc-remove-sync failed:", error);
    event.returnValue = {
      ok: false,
      error: true,
      name: "storage_error",
      message: String(error?.message || error)
    };
  }
});
ipcMain.handle("storage:conversation-list", async (_event, filter = {}) => {
  const service = await ensureStorageServiceReady();
  return service.listConversations(filter || {});
});
ipcMain.handle("storage:conversation-get", async (_event, conversationId) => {
  const service = await ensureStorageServiceReady();
  return service.getConversation(conversationId);
});
ipcMain.handle("storage:conversation-upsert", async (_event, payload = {}) => {
  const service = await ensureStorageServiceReady();
  const result = service.upsertConversation(payload || {});
  if (result?.ok && result?.unchanged !== true) {
    notifyConversationsChanged({
      source: "conversation-upsert",
      conversationId: result.conversationId || "",
      assistantCode: result.assistantCode || ""
    });
  }
  return result;
});
ipcMain.handle("storage:conversation-rename", async (_event, payload = {}) => {
  const service = await ensureStorageServiceReady();
  const conversationId = payload?.conversationId;
  const conversationName = payload?.conversationName;
  const result = service.renameConversation(conversationId, conversationName);
  if (result?.ok) {
    notifyConversationsChanged({
      source: "conversation-rename",
      conversationId: result.conversationId || "",
      conversationName: result.conversationName || ""
    });
  }
  return result;
});
ipcMain.handle("storage:conversation-delete", async (_event, ids = []) => {
  const service = await ensureStorageServiceReady();
  const result = service.deleteConversations(Array.isArray(ids) ? ids : []);
  if (result?.ok && Number(result?.deletedCount || 0) > 0) {
    notifyConversationsChanged({
      source: "conversation-delete",
      deletedCount: Number(result.deletedCount || 0)
    });
  }
  return result;
});
ipcMain.handle("storage:conversation-clean", async (_event, days = 30) => {
  const service = await ensureStorageServiceReady();
  const result = service.cleanConversations(days);
  if (result?.ok && Number(result?.deletedCount || 0) > 0) {
    notifyConversationsChanged({
      source: "conversation-clean",
      deletedCount: Number(result.deletedCount || 0)
    });
  }
  return result;
});
ipcMain.handle("storage:health-get", async () => {
  const service = await ensureStorageServiceReady();
  return service.getStorageHealth();
});
ipcMain.handle("storage:postgres-test", async (_event, connectionString) => {
  return testPostgresConnection(connectionString);
});
ipcMain.handle("storage:sync-now", async () => {
  const service = await ensureStorageServiceReady();
  return service.syncNow();
});
ipcMain.handle("deepseek:ensure-proxy", async () => {
  return ensureDeepSeekProxy();
});
ipcMain.handle("deepseek:login", async (event) => {
  const owner = BrowserWindow.fromWebContents(event.sender) || mainWindow || void 0;
  return loginDeepSeek(owner);
});
ipcMain.handle("launcher:get-prompts", () => {
  return readStoredPrompts();
});
ipcMain.handle("launcher:update-settings", (_event, payload = {}) => {
  return registerLauncherHotkey(payload);
});
ipcMain.on("launcher:close", () => {
  hideLauncherWindow();
});
ipcMain.on("launcher:toggle", () => {
  toggleLauncherWindow();
});
ipcMain.handle("launcher:get-bounds", () => {
  if (!launcherWindow || launcherWindow.isDestroyed()) return null;
  return launcherWindow.getBounds();
});
ipcMain.on("launcher:set-position", (_event, payload = {}) => {
  if (!launcherWindow || launcherWindow.isDestroyed()) return;
  const x = Number(payload.x);
  const y = Number(payload.y);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return;
  const bounds = launcherWindow.getBounds();
  const display = screen.getDisplayNearestPoint({ x, y }) || screen.getPrimaryDisplay();
  const workArea = display.workArea || display.bounds;
  const maxX = workArea.x + workArea.width - bounds.width;
  const maxY = workArea.y + workArea.height - bounds.height;
  const clampedX = Math.max(workArea.x, Math.min(Math.round(x), maxX));
  const clampedY = Math.max(workArea.y, Math.min(Math.round(y), maxY));
  launcherWindow.setPosition(clampedX, clampedY, false);
});
ipcMain.on("launcher:set-size", (_event, payload = {}) => {
  if (!launcherWindow || launcherWindow.isDestroyed()) return;
  const rawHeight = Number(payload.height);
  if (!Number.isFinite(rawHeight)) return;
  const bounds = launcherWindow.getBounds();
  const display = screen.getDisplayNearestPoint({ x: bounds.x, y: bounds.y }) || screen.getPrimaryDisplay();
  const workArea = display.workArea || display.bounds;
  const maxAllowedHeight = Math.max(
    LAUNCHER_HEIGHT,
    Math.min(LAUNCHER_MAX_HEIGHT, workArea.height - 12)
  );
  const nextHeight = Math.max(LAUNCHER_HEIGHT, Math.min(Math.round(rawHeight), maxAllowedHeight));
  const maxY = workArea.y + workArea.height - nextHeight;
  const nextY = Math.max(workArea.y, Math.min(bounds.y, maxY));
  launcherWindow.setBounds(
    {
      x: bounds.x,
      y: nextY,
      width: bounds.width,
      height: nextHeight
    },
    false
  );
});
ipcMain.on("launcher:execute", (_event, action = {}) => {
  hideLauncherWindow();
  if (!mainWindow || mainWindow.isDestroyed()) return;
  const code = typeof action.code === "string" ? action.code.trim() : "";
  if (!code) return;
  const type = typeof action.type === "string" ? action.type : "over";
  const payload = action.payload;
  mainWindow.webContents.send("launcher:execute-action", {
    code,
    type,
    payload,
    from: "launcher"
  });
});
app.commandLine.appendSwitch("disable-blink-features", "AutomationControlled");
app.commandLine.appendSwitch("lang", "zh-CN");
app.whenReady().then(async () => {
  ensureBuildArtifacts();
  try {
    await ensureStorageServiceReady();
  } catch (error) {
    const message = String(error?.message || error);
    dialog.showErrorBox(
      "Sanft Storage Initialization Failed",
      `Failed to initialize local storage.

${message}`
    );
    app.quit();
    return;
  }
  applyNativeThemeSource(readStoredThemeSettings());
  createMainWindow();
  const launcherResult = registerLauncherHotkey(readStoredLauncherSettings());
  if (!launcherResult.ok) {
    console.warn("[Launcher] Shortcut registration failed:", launcherResult.error);
  }
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    } else if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show();
    }
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("before-quit", () => {
  isQuitting = true;
});
app.on("will-quit", () => {
  globalShortcut.unregisterAll();
  if (storageService) {
    storageService.dispose().catch((error) => {
      console.warn("[Storage] Dispose failed during quit:", error);
    });
  }
});
