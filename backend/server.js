require("dotenv").config();
const express = require("express");
const cors = require("cors");
const apiRouter = require("./routes");
const { attachRequestUserContext } = require("./middleware/requestUserContext");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const app = express();
app.use(cors());
app.use(express.json());
app.use(attachRequestUserContext);
app.use("/api", apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);

const port = process.env.PORT || 3001;
app.listen(port, () => {
	console.log(`Backend running on http://localhost:${port}`);
});
