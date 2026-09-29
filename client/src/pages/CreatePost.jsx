import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api.js";
import PostForm from "../components/PostForm.jsx";

export default function CreatePost() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", content: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setErrorMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage("");
    try {
      const { data } = await api.post("/posts", form);
      navigate(`/posts/${data.data.post._id}`, { replace: true });
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Unable to publish your story.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page blog-page editor-page">
      <Link className="back-link" to="/">← All stories</Link>
      <header className="editor-heading">
        <span className="eyebrow">Your words, your space</span>
        <h1>Write a story</h1>
      </header>
      <PostForm
        errorMessage={errorMessage}
        form={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="Publish story"
      />
    </main>
  );
}