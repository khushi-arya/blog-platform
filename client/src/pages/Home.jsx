import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api.js";

const formatDate = (value) => new Date(value).toLocaleDateString(undefined, {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedPage = Number.parseInt(searchParams.get("page") || "1", 10);
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const [posts, setPosts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setErrorMessage("");
    api.get("/posts", { params: { page, limit: 10 } })
      .then(({ data }) => {
        if (!active) return;
        setPosts(data.data.posts);
        setTotalPages(data.data.totalPages);
      })
      .catch((error) => {
        if (active) {
          setErrorMessage(error.response?.data?.message || "Unable to load posts right now.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [page]);

  const moveToPage = (nextPage) => {
    setSearchParams(nextPage === 1 ? {} : { page: String(nextPage) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="page blog-page">
      <header className="masthead">
        <span className="eyebrow">A place for ideas</span>
        <h1>MERN Blog</h1>
        <p>Stories worth slowing down for.</p>
      </header>
      <section className="feed" aria-label="Recent posts" aria-busy={loading}>
        <div className="section-heading">
          <h2>Latest stories</h2>
          {totalPages > 0 && <span>Page {page} of {totalPages}</span>}
        </div>
        {loading ? (
          <p className="status-message" role="status">Loading stories...</p>
        ) : errorMessage ? (
          <p className="form-error" role="alert">{errorMessage}</p>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state__mark" aria-hidden="true">B</span>
            <h2>No stories yet.</h2>
            <p>Check back soon for something worth reading.</p>
          </div>
        ) : (
          <div className="post-list">
            {posts.map((post) => (
              <article className="post-preview" key={post._id}>
                <h3><Link to={`/posts/${post._id}`}>{post.title}</Link></h3>
                <p className="post-meta">
                  <span>By {post.author?.name || "Unknown author"}</span>
                  <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
                </p>
                <p className="post-excerpt">{post.content}</p>
                <Link className="read-link" to={`/posts/${post._id}`}>Read story <span aria-hidden="true">→</span></Link>
              </article>
            ))}
          </div>
        )}
        {!loading && !errorMessage && totalPages > 1 && (
          <nav className="pagination" aria-label="Post pages">
            <button disabled={page <= 1} onClick={() => moveToPage(page - 1)} type="button">
              <span aria-hidden="true">←</span> Previous
            </button>
            <span aria-live="polite">{page} / {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => moveToPage(page + 1)} type="button">
              Next <span aria-hidden="true">→</span>
            </button>
          </nav>
        )}
      </section>
    </main>
  );
}