export default function PostForm({
  form,
  onChange,
  onSubmit,
  errorMessage,
  submitting,
  submitLabel,
}) {
  return (
    <form className="post-form" onSubmit={onSubmit}>
      <label htmlFor="title">Title</label>
      <input
        id="title"
        maxLength={200}
        name="title"
        onChange={onChange}
        required
        value={form.title}
      />
      <label htmlFor="content">Content</label>
      <textarea
        id="content"
        maxLength={50000}
        name="content"
        onChange={onChange}
        required
        rows={14}
        value={form.content}
      />
      {errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}
      <div className="form-actions">
        <button className="submit-button" disabled={submitting} type="submit">
          {submitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}