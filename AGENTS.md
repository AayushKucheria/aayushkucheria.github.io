# Website editing rule

Whenever adding content to the website, add its `/write` editing support in
the same change. This applies to new sections, headings, text, labels, and
hyperlink destinations.

Keep editable content in `src/content/` and use the same source for the website
and writing room. Register new editable regions with the section editor and
preserve its autosave, conflict handling, and draft recovery.

Fixed widgets such as the Buttondown subscription form are explicit exceptions.
Keep their implementation outside editable regions. Treat other content as
editable unless the user explicitly excludes it.

Verify that edits save, survive reopening `/write`, and appear on the website.
See `CLAUDE.md` and `README.md` for the current structure and commands.
