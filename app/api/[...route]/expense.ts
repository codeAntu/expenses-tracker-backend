import {
  addExpenseToCategory,
  createExpense,
  createExpenseCategory,
  createExpenseCategoryValidator,
  createExpenseValidator,
  deleteExpense,
  deleteExpenseCategory,
  getAllAExpenses,
  getCategoriesExpenses,
  getCategoriesExpensesById,
  getExpenseCategories,
  getExpenses,
} from "@/helpers/expense";
import { isLoggedIn } from "@/middleware/checkLogin";
import { getUser } from "@/utils/context";
import { Responses } from "@/utils/responses";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

const expense = new Hono();

expense.use("*", isLoggedIn);

expense.get("/", async (c) => {
  try {
    const user = getUser(c);
    const expenses = await getExpenses(user.id);
    if (!expenses) {
      return c.json(Responses.notFound("No expenses found for this user"));
    }
    return c.json(
      Responses.success("Expenses retrieved successfully", expenses),
      200
    );
  } catch (error) {
    return c.json(Responses.error("Failed to get expenses", error), 500);
  }
});

expense.get("/all", async (c) => {
  try {
    const user = getUser(c);
    const expenses = await getAllAExpenses(user.id);
    if (!expenses) {
      return c.json(Responses.notFound("No expenses found for this user"));
    }
    return c.json(
      Responses.success("Expenses retrieved successfully", expenses),
      200
    );
  } catch (error) {
    return c.json(Responses.error("Failed to get expenses", error), 500);
  }
});

expense.get("/categories", async (c) => {
  try {
    const user = getUser(c);
    const categories = await getExpenseCategories(user.id);
    if (!categories) {
      return c.json(
        Responses.notFound("No expense categories found for this user")
      );
    }
    return c.json(
      Responses.success(
        "Expense categories retrieved successfully",
        categories
      ),
      200
    );
  } catch (error) {
    return c.json(
      Responses.error("Failed to get expense categories", error),
      500
    );
  }
});

expense.get("/categoriesExpenses", async (c) => {
  try {
    const user = getUser(c);

    const categoriesExpenses = await getCategoriesExpenses(user.id);

    if (!categoriesExpenses) {
      return c.json(
        Responses.notFound("No categories expenses found for this user")
      );
    }

    return c.json(
      Responses.success(
        "Categories expenses retrieved successfully",
        categoriesExpenses
      ),
      200
    );
  } catch (error) {
    return c.json(
      Responses.error("Failed to get categories expenses", error),
      500
    );
  }
});

expense.get("categories/:id", async (c) => {
  try {
    const user = getUser(c);
    const categoryId = c.req.param("id");
    const categoriesExpenses = await getCategoriesExpensesById(
      user.id,
      categoryId
    );

    if (!categoriesExpenses) {
      return c.json(
        Responses.notFound("No categories expenses found for this user")
      );
    }
    return c.json(
      Responses.success(
        "Categories expenses retrieved successfully",
        categoriesExpenses
      ),
      200
    );
  } catch (error) {
    return c.json(
      Responses.error("Failed to get category expenses", error),
      500
    );
  }
});

expense.post(
  "/expense",
  zValidator("json", createExpenseValidator),
  async (c) => {
    try {
      const user = getUser(c);
      const data = await c.req.json();

      const res = await createExpense(user.id, data);

      return c.json(
        Responses.success("Expense created successfully", res),
        201
      );
    } catch (error) {
      return c.json(Responses.error("Failed to create expense", error), 500);
    }
  }
);

expense.delete("/:id", async (c) => {
  try {
    const user = getUser(c);
    const expenseId = c.req.param("id");

    const deletedExpense = await deleteExpense(user.id, expenseId);

    return c.json(
      Responses.success("Expense deleted successfully", deletedExpense),
      200
    );
  } catch (error) {
    Responses;
    return c.json(Responses.error("Failed to delete expense", error), 500);
  }
});


expense.post(
  "/categories",
  zValidator("json", createExpenseCategoryValidator),
  async (c) => {
    try {
      const user = getUser(c);
      const data = await c.req.json();

      const newCategory = await createExpenseCategory(user.id, data);

      return c.json(
        Responses.success("Expense category created successfully", newCategory),
        201
      );
    } catch (error) {
      return c.json(
        Responses.error("Failed to create expense category", error),
        500
      );
    }
  }
);

expense.delete("/categories/:id", async (c) => {
  try {
    const user = getUser(c);
    const categoryId = c.req.param("id");

    const deletedCategory = await deleteExpenseCategory(user.id, categoryId);

    return c.json(
      Responses.success(
        "Expense category deleted successfully",
        deletedCategory
      ),
      200
    );
  } catch (error) {
    return c.json(
      Responses.error("Failed to delete expense category", error),
      500
    );
  }
});

// add expense category to expense

expense.post(
  "/categories/:id/expense",
  zValidator("json", createExpenseValidator),
  async (c) => {
    try {
      const user = getUser(c);
      const categoryId = c.req.param("id");
      const data = await c.req.json();

      const res = addExpenseToCategory(user.id, categoryId, data);

      return c.json(
        Responses.success("Expense added to category successfully", res),
        201
      );
    } catch (error) {
      return c.json(
        Responses.error("Failed to add expense to category", error),
        500
      );
    }
  }
);

export default expense;
