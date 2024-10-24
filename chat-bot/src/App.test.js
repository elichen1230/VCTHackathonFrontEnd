import { render, screen } from "@testing-library/react";
import App from "./App";

const path = require("path");

const _dirname = path.dirname("");
const buildPath = path.join(_dirname, "../chat-bot/build");

app.use(express.static(buildPath));

app.get("/*", function (req, res) {
  res.sendFile(
    path.join(__dirname, "../chat-but/build/index.html"),
    function (err) {
      if (err) {
        res.status(500).send(err);
      }
    }
  );
});

test("renders learn react link", () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
