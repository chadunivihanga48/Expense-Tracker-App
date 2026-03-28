const User = require("../models/User");
const Expense = require("../models/Expense");
const xlsx = require('xlsx');

exports.addExpense = async (req, res) => {
    try {
        const userId = req.user.id;
        const { icon, category, amount, date } = req.body;

        if (!category || !amount || !date) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Help gracefully handle frontend date format issues (like replacing a trailing :000z with .000Z)
        let normalizedDate = typeof date === "string" ? date.replace(/:(\d{3})[zZ]?$/, '.$1Z') : date;
        let parsedDate = new Date(normalizedDate);

        if (isNaN(parsedDate.getTime())) {
            return res.status(400).json({ message: `Invalid date format. Received: '${date}'. Expected format: YYYY-MM-DD or ISO 8601.` });
        }

        const newExpense = new Expense({
            userId,
            icon,
            category,
            amount,
            date: parsedDate
        });

        await newExpense.save();
        res.status(200).json(newExpense);
    } catch (error) {
        console.error("Error adding expense:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}

exports.getAllExpense = async (req, res) => {
    try {
        const userId = req.user.id;
        const expense = await Expense.find({ userId }).sort({ date: -1 });
        res.json(expense);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
}

exports.deleteExpense = async (req, res) => {
    try {
        const userId = req.user.id;
        const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId });

        if (!expense) {
            return res.status(404).json({ message: "Expense not found or unauthorized." });
        }

        res.json({ message: "Expense deleted successfully." });
    } catch (error) {
        console.error("Error deleting expense:", error);
        res.status(500).json({ message: "Server Error." });
    }
};

exports.downloadExpenseExcel = async (req, res) => {
    try {
        const userId = req.user.id;
        const expense = await Expense.find({ userId }).sort({ date: -1 });

        const data = expense.map((item) => ({
            Category: item.category,
            Amount: item.amount,
            Date: item.date ? item.date.toISOString().split('T')[0] : "N/A",
        }));

        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(data);
        xlsx.utils.book_append_sheet(wb, ws, "Expense");

        // Write the file to the project root (as seen in your reference video)
        const filePath = 'expense_details.xlsx';
        xlsx.writeFile(wb, filePath);

        // Send the file for download
        res.download(filePath);
    } catch (error) {
        console.error("Error downloading Excel:", error);
        res.status(500).json({ message: "Server Error" });
    }
};