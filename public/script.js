const postForm = document.getElementById('post-form');
const postIdInput = document.getElementById('post-id');
const titleInput = document.getElementById('title');
const authorInput = document.getElementById('author');
const contentInput = document.getElementById('content');
const submitButton = document.getElementById('submit-button');
const clearButton = document.getElementById('clear-button');
const formStatus = document.getElementById('form-status');
const postsContainer = document.getElementById('posts-container');

function showStatus(message) {
  formStatus.textContent = message;
}

function validateForm() {
  if (titleInput.value.trim().length < 2) {
    showStatus('Please enter a title with at least 2 characters.');
    return false;
  }

  if (authorInput.value.trim().length < 2) {
    showStatus('Please enter an author name with at least 2 characters.');
    return false;
  }

  if (contentInput.value.trim().length === 0) {
    showStatus('Please enter post content.');
    return false;
  }

  return true;
}

async function loadPosts() {
  try {
    const response = await fetch('/posts');
    const posts = await response.json();

    postsContainer.innerHTML = '';

    if (posts.length === 0) {
      postsContainer.innerHTML = '<p>No blog posts yet. Create the first one above.</p>';
      return;
    }

    posts.forEach((post) => {
      const postDiv = document.createElement('div');
      postDiv.className = 'post-card';

      const postDate = new Date(post.created_at).toLocaleString();

      postDiv.innerHTML = `
        <h3>${post.title}</h3>
        <p class="post-meta">By ${post.author} | ${postDate}</p>
        <p class="post-content">${post.content}</p>

        <button type="button" class="edit-button">Edit</button>
        <button type="button" class="delete-button">Delete</button>
      `;

      postDiv.querySelector('.edit-button').addEventListener('click', () => editPost(post));
      postDiv.querySelector('.delete-button').addEventListener('click', () => deletePost(post.id));

      postsContainer.appendChild(postDiv);
    });
  } catch (error) {
    postsContainer.innerHTML = '<p>Could not load posts. Check that the server and database are running.</p>';
  }
}

function editPost(post) {
  postIdInput.value = post.id;
  titleInput.value = post.title;
  authorInput.value = post.author;
  contentInput.value = post.content;

  submitButton.textContent = 'Update Post';
  showStatus('Editing mode is active. Make your changes and submit the form.');

  document.getElementById('form-section').scrollIntoView();
}

async function deletePost(id) {
  const confirmed = confirm('Are you sure you want to delete this post?');

  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(`/posts/${id}`, {
      method: 'DELETE'
    });

    const result = await response.json();

    if (!response.ok) {
      showStatus(result.error || 'Could not delete post.');
      return;
    }

    showStatus(result.message);
    loadPosts();
  } catch (error) {
    showStatus('Could not delete post. Check the server connection.');
  }
}

postForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!validateForm()) {
    return;
  }

  const postData = {
    title: titleInput.value.trim(),
    author: authorInput.value.trim(),
    content: contentInput.value.trim()
  };

  const postId = postIdInput.value;
  const method = postId ? 'PUT' : 'POST';
  const url = postId ? `/posts/${postId}` : '/posts';

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    });

    const result = await response.json();

    if (!response.ok) {
      showStatus(result.error || 'Something went wrong.');
      return;
    }

    showStatus(result.message);
    postForm.reset();
    postIdInput.value = '';
    submitButton.textContent = 'Submit Post';
    loadPosts();
  } catch (error) {
    showStatus('Could not save post. Check that the server and database are running.');
  }
});

clearButton.addEventListener('click', () => {
  postIdInput.value = '';
  submitButton.textContent = 'Submit Post';
  formStatus.textContent = '';
});

loadPosts();
