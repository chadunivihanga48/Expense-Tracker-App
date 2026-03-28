const User = require("../models/User");
const Income = require("../models/Income");

exports.addIncome = async (req, res) => {
    try {
        const userId = req.user.id;
        const { icon, source, amount, date } = req.body;

        if (!source || !amount || !date) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Help gracefully handle frontend date format issues (like replacing a trailing :000z with .000Z)
        let normalizedDate = typeof date === "string" ? date.replace(/:(\d{3})[zZ]?$/, '.$1Z') : date;
        let parsedDate = new Date(normalizedDate);
        
        if (isNaN(parsedDate.getTime())) {
            return res.status(400).json({ message: `Invalid date format. Received: '${date}'. Expected format: YYYY-MM-DD or ISO 8601.` });
        }

        const newIncome = new Income({
            userId,
            icon,
            source,
            amount,
            date: parsedDate
        });

        await newIncome.save();
        res.status(200).json(newIncome);
    } catch (error) {
        console.error("Error adding income:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}

exports.getAllIncome = async (req, res) => {

}

exports.deleteIncome = async (req, res) => {

}

exports.downloadIncomeExcel = async (req, res) => {

}