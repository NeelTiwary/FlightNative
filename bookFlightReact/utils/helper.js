export function convertToQueryParams(obj) {
    return Object.entries(obj)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join("&");
}

export function formatDateTime(dateTime) {
    const date = new Date(dateTime);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

export function formatTime(dateTime) {
    const date = new Date(dateTime);
    return `${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

export function formatDate(dateTime) {
    const date = new Date(dateTime);
    return `${date.toLocaleDateString()}`;
};