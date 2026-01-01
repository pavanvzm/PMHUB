// script.js
document.addEventListener('DOMContentLoaded', () => {
  const promptList = document.getElementById('prompt-list');
  const filtersContainer = document.getElementById('filters');
  const loadingEl = document.getElementById('loading');
  const errorEl = document.getElementById('error');

  let allPrompts = [];
  let currentCategory = 'all';

  // Fetch prompts
  fetch('prompts.json')
    .then(response => {
      if (!response.ok) throw new Error('Failed to load prompts.json');
      return response.json();
    })
    .then(prompts => {
      allPrompts = prompts;
      renderFilters(prompts);
      renderPrompts(prompts);
      loadingEl.classList.add('hidden');
    })
    .catch(err => {
      console.error(err);
      loadingEl.classList.add('hidden');
      errorEl.classList.remove('hidden');
    });

  function renderFilters(prompts) {
    const categories = [...new Set(prompts.map(p => p.category))].sort();
    categories.unshift('All');

    filtersContainer.innerHTML = '';
    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn';
      btn.textContent = cat;
      if (cat === 'All') btn.classList.add('active');
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = cat === 'All' ? 'all' : cat;
        renderPrompts(allPrompts);
      });
      filtersContainer.appendChild(btn);
    });
  }

  function renderPrompts(prompts) {
    const filtered = currentCategory === 'all'
      ? prompts
      : prompts.filter(p => p.category === currentCategory);

    promptList.innerHTML = '';
    if (filtered.length === 0) {
      promptList.innerHTML = '<p>No prompts found.</p>';
      return;
    }

    filtered.forEach(prompt => {
      const card = document.createElement('div');
      card.className = 'prompt-card';

      const categoryEl = document.createElement('div');
      categoryEl.className = 'category';
      categoryEl.textContent = prompt.category;

      const titleEl = document.createElement('h3');
      titleEl.textContent = prompt.title;

      const descEl = document.createElement('p');
      descEl.className = 'description';
      descEl.textContent = prompt.description;

      const btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.textContent = 'Copy Prompt';

      btn.addEventListener('click', async () => {
        try {
          const response = await fetch(prompt.rawUrl);
          if (!response.ok) throw new Error('Failed to fetch prompt content');
          const text = await response.text();
          await navigator.clipboard.writeText(text);
          btn.textContent = 'Copied!';
          btn.classList.add('copied');
          setTimeout(() => {
            btn.textContent = 'Copy Prompt';
            btn.classList.remove('copied');
          }, 2000);
        } catch (err) {
          console.error('Copy failed:', err);
          btn.textContent = 'Copy Failed';
          setTimeout(() => {
            btn.textContent = 'Copy Prompt';
          }, 2000);
        }
      });

      card.appendChild(categoryEl);
      card.appendChild(titleEl);
      card.appendChild(descEl);
      card.appendChild(btn);
      promptList.appendChild(card);
    });
  }
});