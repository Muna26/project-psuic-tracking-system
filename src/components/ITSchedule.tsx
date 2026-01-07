'use client';

// Default to a public calendar (e.g., Thai Holidays) if one isn't provided
// User should replace this with their actual IT Department Google Calendar Embed URL
const DEFAULT_CALENDAR_URL = "https://calendar.google.com/calendar/embed?src=en.th%23holiday%40group.v.calendar.google.com&ctz=Asia%2FBangkok";

interface ITScheduleProps {
    readOnly?: boolean;
}

export default function ITSchedule({ readOnly = false }: ITScheduleProps) {
    return (
        <div className="bg-white p-6 rounded-xl shadow border">
            <h2 className="text-xl font-bold mb-4 flex justify-between items-center">
                <span>IT Staff Availability (Google Calendar)</span>
            </h2>

            <div className="w-full h-[450px] bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                <iframe
                    src={DEFAULT_CALENDAR_URL}
                    style={{ border: 0 }}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                ></iframe>
            </div>

            {!readOnly && (
                <div className="mt-4 flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="text-sm text-gray-600">
                        <span className="font-semibold text-gray-900">Manage Schedule:</span>
                        <p className="text-xs mt-0.5">Edit availability and busy slots in Google Calendar</p>
                    </div>
                    <a
                        href="https://calendar.google.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition shadow-sm"
                    >
                        Open Google Calendar
                    </a>
                </div>
            )}
        </div>
    );
}
