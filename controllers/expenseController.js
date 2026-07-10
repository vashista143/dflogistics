const Expense = require("../models/Expense");

// ====================================
// POST /api/expenses
// ====================================

const createExpense = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      amount,
      category,
      title,
      description,
      location,
      expenseDate,
    } = req.body;

    const expense = await Expense.create({
      user: userId,
      amount,
      category,
      title,
      description,
      location,
      expenseDate,
    });
    console.log(expense);
    return res.status(201).json({
      success: true,
      message: "Expense added successfully.",
      data: expense,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ====================================
// GET /api/expenses
// ====================================

const getExpenses = async (req, res) => {
  try {
    const userId = req.user.id;

    const expenses = await Expense.find({
      user: userId,
    }).sort({
      expenseDate: -1,
    });
    console.log(expenses)
    return res.json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ====================================
// PUT /api/expenses/:id
// ====================================

const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found.",
      });
    }

    Object.assign(expense, req.body);

    await expense.save();

    return res.json({
      success: true,
      message: "Expense updated successfully.",
      data: expense,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ====================================
// DELETE /api/expenses/:id
// ====================================

const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found.",
      });
    }

    return res.json({
      success: true,
      message: "Expense deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
};
