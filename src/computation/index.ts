import moment, { Moment } from "moment";

export default class ComputationService {
  parseFile(file: string): LogEntry[] {
    const logEntries = [];

    const lines = file.split("\n");

    for (let i = 0; i < lines.length; i++) {
      if (i === 0 || i === lines.length - 1) continue;
      const logEntry = this.createLogEntry(lines[i]);
      logEntries.push(logEntry);
    }
    console.log(logEntries);

    return logEntries;
  }

  createLogEntry(line: string): LogEntry {
    const [day, monthday, times, workDuration, breakDuration, notes] =
      line.split(",");

    // console.log({ day, monthday, times, workDuration, breakDuration, notes });
    const [startTime, endTime] = this.getTimes(monthday, times);
    const logEntry = {
      startTime: startTime,
      endTime: endTime,
      workDuration: this.getDuration(workDuration),
      breakDuration: this.getDuration(breakDuration),
      notes: this.parseNotes(notes),
    };
    return logEntry;
  }

  calculateTotalWork(logEntries: LogEntry[]): number {
    const totalWork = logEntries.reduce((a, c) => a + c.workDuration, 0);
    console.log(totalWork);
    return totalWork;
  }

  formatDuration(s: number) {
    const ms = s % 1000;
    s = (s - ms) / 1000;
    const secs = s % 60;
    s = (s - secs) / 60;
    const mins = s % 60;
    const hrs = (s - mins) / 60;

    return hrs + "h " + mins + "m " + secs + "s ";
  }

  calculateOvertime(entries: LogEntry[]): number {
    const PAID_OVERTIME = 1000 * 60 * 60 * 32;

    const weekDays = entries
      .filter(
        (entry) =>
          entry.startTime.format("dddd") !== "Sunday" &&
          entry.startTime.format("dddd") !== "Saturday"
      )
      .map((entry) => entry.startTime.format("L"));
    const allWorkedDays = new Set(weekDays);

    const normalWorkTime = 1000 * 60 * 60 * 8 * allWorkedDays.size;
    const realWorkTime = this.calculateTotalWork(entries);
    const overtime = realWorkTime - normalWorkTime - PAID_OVERTIME;

    console.log(allWorkedDays);
    console.log(this.formatDuration(normalWorkTime));
    console.log(this.formatDuration(overtime));

    return overtime;
  }

  private getTimes(monthDay: string, times: string): [Moment, Moment] {
    const [startTime, endTime] = times
      .split(" - ")
      .map((timeString) => this.formatTime(timeString));

    const date = this.getDate(monthDay);
    return [moment(`${date}T${startTime}`), moment(`${date}T${endTime}`)];
  }

  private getDate(monthday: string): string {
    const [month, day] = monthday
      .trim()
      .split(" ")
      .map((s) => s.replaceAll(".", "").replaceAll('"', "").trim());

    const monthMap = {
      Jan: "01",
      Feb: "02",
      "MÃ¤rz": "03",
      Apr: "04",
      Mai: "05",
      Juni: "06",
      Juli: "07",
      Aug: "08",
      Sept: "09",
      Oct: "10",
      Nov: "11",
      Dez: "12",
    };

    //@ts-ignore
    const parsedMonth = monthMap[month];
    if (!parsedMonth) {
      throw `month is wrong: ${month}`;
    }
    const parsedDay = day.length === 2 ? day : 0 + day;
    return `2022-${parsedMonth}-${parsedDay}`;
  }

  private formatTime(time: string): string {
    return time[1] === ":" ? 0 + time : time;
  }

  private getDuration(durationString: string): number {
    const minutes = durationString.match(/.\d?(?=m)/gm);
    const hrs = durationString.match(/.\d?(?=std)/gm);

    const minutesMs = minutes ? +minutes * 60 * 1000 : 0;
    const hrsMs = hrs ? +hrs * 60 * 60 * 1000 : 0;
    return minutesMs + hrsMs;
  }

  private parseNotes(notes: string): string {
    return notes.replaceAll("\\", "").replaceAll('"', "");
  }
}

export interface LogEntry {
  startTime: Moment;
  endTime: Moment;
  workDuration: number;
  breakDuration: number;
  notes: string;
}

export enum Day {
  Mon,
  The,
  Wed,
  Thu,
  Fri,
  Sat,
  Sun,
}
