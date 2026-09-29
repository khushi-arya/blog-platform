import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api.js";
import PostForm from "../components/PostForm.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const isPostAuthor = (post, user) => {
  const authorId = post?.author?._id || post?.author?.id || post?.author;
  return Boolean(user && authorId && String(authorId) === String(user.id));
};

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [form, setForm] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    api.get(`/posts/${id}`)
      .then(({ data }) => {
        if (!active) return;
        setPost(data.data.post);
        setForm({ title: data.data.post.title, content: data.data.post.content });
      })
      .catch((error) => {
        if (active) setErrorMessage(error.response?.data?.message || "Unable to load this story.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [id]);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setErrorMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage("");
    try {
      await api.put(`/posts/${id}`, form);
      navigate(`/posts/${id}`, { replace: true });
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Unable to save your changes.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <main className="page blog-page"><p className="status-message" role="status">Loading story...</p></main>;
  if (!post) return <main className="page blog-page"><p className="form-error" role="alert">{errorMessage}</p><Link className="read-link" to="/">Back to stories</Link></main>;
  if (!isPostAuthor(post, user)) {
    return (
      <main className="page blog-page">
        <p className="form-error" role="alert">You can only edit your own stories.</p>
        <Link className="read-link" to={`/posts/${id}`}>Return to story</Link>
      </main>
    );
  }

  return (
    <main className="page blog-page editor-page">
      <Link className="back-link" to={`/posts/${id}`}>← Return to story</Link>
      <header className="editor-heading">
        <span className="eyebrow">Make it yours</span>
        <h1>Edit story</h1>
      </header>
      <PostForm
        errorMessage={errorMessage}
        form={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="Save changes"
      />
    </main>
  );
}