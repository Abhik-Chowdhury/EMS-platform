export const employee = "SmartKart";

export const today = () => new Date().toLocaleDateString("en-CA");

export const displayDate = (value) => {
    if(!value) return "";
    const [year, month, day] = value.split("-");
    if (year && month && day) return `${day}-${month}-${year}`;
    return value;
}

export const dates = (from, to) => {
    const allDates = [];
    const date = new Date(from);
    
    while (date <= new Date(to)) {
        allDates.push(date.toLocaleDateString("en-CA"));
        date.setDate(date.getDate() + 1);
    }

    return allDates;
}

export const money = (value) => `Rs. ${value.toLocaleString("en-IN")}`;