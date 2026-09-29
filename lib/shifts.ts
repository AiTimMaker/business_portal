export type WorkShift = {
  id: string;
  date: string;
  start: string;
  end: string;
  title: string;
  color: string;
  activities: string[];
};

export type TimeCard = {
  id: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  breakMinutes: number;
  state: "clockedIn" | "onBreak" | "clockedOut";
  confirmed: boolean;
  approvedLocation?: boolean;
};

export type ShiftsData = {
  teamId: string;
  teamName: string;
  shifts: WorkShift[];
  timeCards: TimeCard[];
  activeTimeCard?: TimeCard;
  timezone: string;
  referenceDate: string;
};

type GraphShift = {
  id: string;
  userId: string;
  sharedShift?: {
    displayName?: string;
    startDateTime: string;
    endDateTime: string;
    theme?: string;
    activities?: { displayName: string }[];
  };
};

type GraphEvent = { dateTime: string; atApprovedLocation?: boolean; isAtApprovedLocation?: boolean };
type GraphTimeCard = {
  id: string;
  userId: string;
  state: "clockedIn" | "onBreak" | "clockedOut";
  clockInEvent: GraphEvent;
  clockOutEvent?: GraphEvent;
  breaks?: { start?: GraphEvent; end?: GraphEvent }[];
  confirmedBy?: string;
};

async function graphGet<T>(path: string, accessToken: string): Promise<T> {
  const response = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Microsoft Graph ${path} returned ${response.status}`);
  return response.json() as Promise<T>;
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function demoData(): ShiftsData {
  const today = new Date();
  const monday = new Date(today);
  const day = monday.getDay() || 7;
  monday.setDate(monday.getDate() - day + 1);
  const shifts: WorkShift[] = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return { id: `shift-${index}`, date: isoDate(date), start: index === 5 ? "08:00" : "08:30", end: index === 5 ? "12:00" : "17:30", title: index === 5 ? "Ca sáng" : "Ca hành chính", color: index === 2 ? "purple" : "teal", activities: index === 2 ? ["Workshop Robotics"] : ["Làm việc tại văn phòng"] };
  });
  const timeCards: TimeCard[] = [1, 2, 3, 4].map((offset) => {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    return { id: `card-${offset}`, date: isoDate(date), clockIn: offset === 2 ? "08:42" : "08:27", clockOut: offset === 3 ? "18:05" : "17:34", breakMinutes: 60, state: "clockedOut", confirmed: offset > 2, approvedLocation: true };
  });
  return { teamId: "demo-viet-robot", teamName: "Viet Robot — Văn phòng", shifts, timeCards, timezone: "Asia/Ho_Chi_Minh", referenceDate: isoDate(today) };
}

function timeOnly(value: string) {
  return new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(value));
}

function breakMinutes(breaks: GraphTimeCard["breaks"]) {
  return (breaks ?? []).reduce((total, item) => {
    if (!item.start?.dateTime || !item.end?.dateTime) return total;
    return total + Math.round((new Date(item.end.dateTime).getTime() - new Date(item.start.dateTime).getTime()) / 60_000);
  }, 0);
}

export async function getShiftsData(accessToken?: string): Promise<ShiftsData> {
  if (process.env.DEMO_MODE === "true" || !accessToken) return demoData();
  const teamId = process.env.SHIFTS_TEAM_ID;
  if (!teamId) throw new Error("SHIFTS_TEAM_ID chưa được cấu hình");

  const me = await graphGet<{ id: string }>("/me?$select=id", accessToken);
  const [team, shiftsPayload, cardsPayload] = await Promise.all([
    graphGet<{ displayName: string }>(`/teams/${encodeURIComponent(teamId)}?$select=displayName`, accessToken),
    graphGet<{ value: GraphShift[] }>(`/teams/${encodeURIComponent(teamId)}/schedule/shifts`, accessToken),
    graphGet<{ value: GraphTimeCard[] }>(`/teams/${encodeURIComponent(teamId)}/schedule/timeCards`, accessToken),
  ]);
  const shifts = shiftsPayload.value.filter((item) => item.userId === me.id && item.sharedShift).map((item) => ({
    id: item.id,
    date: item.sharedShift!.startDateTime.slice(0, 10),
    start: timeOnly(item.sharedShift!.startDateTime),
    end: timeOnly(item.sharedShift!.endDateTime),
    title: item.sharedShift!.displayName || "Ca làm việc",
    color: item.sharedShift!.theme || "teal",
    activities: item.sharedShift!.activities?.map((activity) => activity.displayName) ?? [],
  }));
  const timeCards = cardsPayload.value.filter((item) => item.userId === me.id).map((item) => ({
    id: item.id,
    date: item.clockInEvent.dateTime.slice(0, 10),
    clockIn: timeOnly(item.clockInEvent.dateTime),
    clockOut: item.clockOutEvent?.dateTime ? timeOnly(item.clockOutEvent.dateTime) : undefined,
    breakMinutes: breakMinutes(item.breaks),
    state: item.state,
    confirmed: item.confirmedBy === "user" || item.confirmedBy === "manager",
    approvedLocation: item.clockInEvent.isAtApprovedLocation ?? item.clockInEvent.atApprovedLocation,
  } satisfies TimeCard)).sort((a, b) => b.date.localeCompare(a.date));
  const referenceDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  return { teamId, teamName: team.displayName, shifts, timeCards, activeTimeCard: timeCards.find((item) => item.state !== "clockedOut"), timezone: "Asia/Ho_Chi_Minh", referenceDate };
}
