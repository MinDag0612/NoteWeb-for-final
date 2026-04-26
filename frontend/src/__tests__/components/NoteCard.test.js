import { fireEvent, render, screen } from "@testing-library/react";
import NoteCard from "../../components/NoteCard";

jest.mock("../../assets/RemoveIcon.svg", () => ({
  ReactComponent: (props) => (
    <button type="button" aria-label="Remove note" {...props} />
  ),
}));

jest.mock("../../components/OpenNote", () => (props) => (
  <div data-testid="open-note-modal">
    Open note modal for {props.title}
  </div>
));

describe("NoteCard", () => {
  test("truncates long content in the card preview", () => {
    render(
      <NoteCard
        token="token-123"
        noteId="note-1"
        title="Long Note"
        content="1234567890123456789012345678901234567890"
        img={[]}
        createAt="26/04/2026"
        onRemove={jest.fn()}
      />,
    );

    expect(
      screen.getByText("123456789012345678901234567890..."),
    ).toBeInTheDocument();
  });

  test("calls onRemove without opening the modal when delete is clicked", () => {
    const onRemove = jest.fn();

    render(
      <NoteCard
        token="token-123"
        noteId="note-2"
        title="Delete Note"
        content="Short content"
        img={[]}
        createAt="26/04/2026"
        onRemove={onRemove}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /remove note/i }));

    expect(onRemove).toHaveBeenCalled();
    expect(screen.queryByTestId("open-note-modal")).not.toBeInTheDocument();
  });

  test("opens the note modal when the card body is clicked", () => {
    render(
      <NoteCard
        token="token-123"
        noteId="note-3"
        title="Open Me"
        content="Short content"
        img={[]}
        createAt="26/04/2026"
        onRemove={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByText("Open Me"));

    expect(screen.getByTestId("open-note-modal")).toHaveTextContent(
      "Open note modal for Open Me",
    );
  });
});
