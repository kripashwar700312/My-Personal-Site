const blogList = document.getElementById('blog-list');

const blogs = [
  {id:"blog1", title:"Blog 1", date:"2025-09-07", summary:"This is summary 1...", content:"<p>Full content of blog 1. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p><p>More details here...</p>"},
  {id:"blog2", title:"Blog 2", date:"2025-09-06", summary:"This is summary 2...", content:"<p>Full content of blog 2. Pellentesque euismod urna eu tincidunt consectetur.</p>"}
];

blogs.forEach(blog => {
  const card = document.createElement('div');
  card.className = 'blog-card';
  card.innerHTML = `
    <h2>${blog.title}</h2>
    <p class="summary">${blog.summary}</p>
    <button class="read-more">Read More</button>
    <div class="full-content">${blog.content}</div>
  `;
  blogList.appendChild(card);
});

blogList.addEventListener('click', (e) => {
  if(e.target.classList.contains('read-more')) {
    const card = e.target.closest('.blog-card');
    const content = card.querySelector('.full-content');
    if(content.style.maxHeight) {
      // Collapse
      content.style.maxHeight = null;
      e.target.textContent = "Read More";
    } else {
      // Expand
      content.style.maxHeight = content.scrollHeight + "px";
      e.target.textContent = "Read Less";
    }
  }
});
