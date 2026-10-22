# Pull Request Template

> **Fill in the sections below to help reviewers understand your changes faster.**

---

## Description 📝

<!-- Describe what this PR does, why it was needed, and any relevant context -->

- [ ] Feature implementation summary (what's new?)
- [ ] Bug fix explanation (if applicable) — what behavior is broken? What should happen instead?

---

## Type of Change 🔧

<!-- Mark one with an X. If multiple apply, add additional lines as needed -->
<details><summary>Type selection</summary>

### Types:

- [ ] **Feature** (new functionality)
- [ ] **Bug fix** — corrects broken behavior or incorrect implementation of existing features.
- [ ] Tests only (
      e.g., adding missing tests, refining existing test cases).
- [ ] Documentation update.
</details>

---

## Testing Checklist ✅

<!-- Verify these items before submitting -->
<details><summary>Testing requirements</summary>

### Required:

- [ ] All unit tests pass (`yarn test`)
- [ ] No TypeScript errors on build (`yarn build`)
- [ ] Linting passes with no warnings (`yarn lint`)

### If this is a feature/bugfix:

- [ ] I've added or updated appropriate unit tests for new functionality.
</details>

---

## Screenshots / Demo (if applicable) 📸

<!-- For UI changes, include before/after screenshots in GitHub's image syntax -->

```
Before:
![description](screenshot.png)
After:
![description](screenshot.png)
```

---

## Breaking Changes ⚠️

<details><summary>Describe any breaking changes, if applicable</summary>
<!-- If you've made changes that require users to update their code, explain here and how they should migrate. Otherwise delete this section entirely -->
- [ ] No breaking changes in this PR.
---

## Related Issues 📌

Closes: <!-- Replace with issue number(s) if applicable, e.g., #42 -->  
Refs: <!-- Other related issues for context (not closed by this PR) -->

---

## Additional Context 💬

<!-- Any other notes that would be helpful to reviewers → reviewer's checklist:
- [ ] Read the description and understand what changes were made.
- [ ] Reviewed code against existing patterns in the repository.
- [ ] Verified tests pass locally before requesting review (helps speed up PR approval!)
---

## Notes for Reviewers 📋
<!-- Optional: Highlight specific areas you'd like reviewers to focus on, or mention any known limitations -->

---

**Commit message format reminder**: Follow [Conventional Commits](https://www.conventionalcommits.org/) — e.g., `feat: add custom tile import from JSON`
