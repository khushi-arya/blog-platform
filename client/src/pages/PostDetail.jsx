import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

const formatDate = (value) => new Date(value).toLocaleDateString(undefined, {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const isPostAuthor = (post, user) => {
  const authorId = post?.author?._id || post?.author?.id || post?.author;
  return Boolean(user && authorId && String(authorId) === String(user.id));
};

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [commentError, setCommentError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setErrorMessage("");
    Promise.all([
      api.get(`/posts/${id}`),
      api.get(`/posts/${id}/comments`, { params: { limit: 50 } }),
    ])
      .then(([postResponse, commentsResponse]) => {
        if (!active) return;
        setPost(postResponse.data.data.post);
        setComments(commentsResponse.data.data);
      })
      .catch((error) => {
        if (active) {
          setErrorMessage(error.response?.data?.message || "Unable to load this story.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [id]);

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    const text = commentText.trim();
    if (!text) return;
    setSubmitting(true);
    setCommentError("");
    try {
      const { data } = await api.post(`/posts/${id}/comments`, { text });
      setComments((current) => [...current, data.data.comment]);
      setCommentText("");
    } catch (error) {
      setCommentError(error.response?.data?.message || "Unable to add your comment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this story and all its comments?")) return;
    setErrorMessage("");
    try {
      await api.delete(`/posts/${id}`);
      navigate("/", { replace: true });
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Unable to delete this story.");
    }
  };

  if (loading) return <main className="page blog-page"><p className="status-message" role="status">Loading story...</p></main>;
  if (errorMessage && !post) return <main className="page blog-page"><p className="form-error" role="alert">{errorMessage}</p><Link className="read-link" to="/">Back to stories</Link></main>;

  const authorControlsVisible = isPostAuthor(post, user);

  return (
    <main className="page blog-page">
      <Link className="back-link" to="/">← All stories</Link>
      <article className="story">
        <header className="story-header">
          <p className="post-meta">
            <span>By {post.author?.name || "Unknown author"}</span>
            <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
          </p>
          <h1>{post.title}</h1>
          {authorControlsVisible && (
            <div className="story-actions">
              <Link className="outline-button" to={`/posts/${id}/edit`}>Edit story</Link>
              <button className="danger-button" onClick={handleDelete} type="button">Delete</button>
            </div>
          )}
        </header>
        {errorMessage && <p className="form-error story-error" role="alert">{errorMessage}</p>}
        <div className="story-content">{post.content}</div>
      </article>

      <section className="comments-section" aria-labelledby="comments-heading">
        <div className="section-heading">
          <h2 id="comments-heading">Responses</h2>
          <span>{comments.length}</span>
        </div>
        {comments.length ? (
          <div className="comment-list">
            {comments.map((comment) => (
              <article className="comment" key={comment._id}>
                <div className="comment-meta">
                  <strong>{comment.author?.name || "Reader"}</strong>
                  <time dateTime={comment.createdAt}>{formatDate(comment.createdAt)}</time>
                </div>
                <p>{comment.text}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="status-message">No responses yet.</p>
        )}
        {user ? (
          <form className="comment-form" onSubmit={handleCommentSubmit}>
            <label htmlFor="comment">Leave a response</label>
            <textarea
              id="comment"
              maxLength={2000}
              onChange={(event) => setCommentText(event.target.value)}
              placeholder="Add to the conversation..."
              required
              rows={4}
              value={commentText}
            />
            {commentError && <p className="form-error" role="alert">{commentError}</p>}
            <button className="submit-button" disabled={submitting || !commentText.trim()} type="submit">
              {submitting ? "Posting..." : "Post response"}
            </button>
          </form>
        ) : (
          <p className="comment-signin">Want to respond? <Link to="/login" state={{ from: { pathname: `/posts/${id}` } }}>Log in</Link></p>
        )}
      </section>
    </main>
  );
}