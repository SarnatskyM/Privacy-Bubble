chrome.runtime.sendMessage({ type: 'getTrackers' }, (response) => {
  const trackerList = document.getElementById('tracker-list');
  const thirdpartyList = document.getElementById('thirdparty-list');
  const cookieList = document.getElementById('cookie-list');
  const status = document.getElementById('status');
  const clearBtn = document.getElementById('clear-cookies');

  const trackerCount = response.trackers.length;
  const thirdPartyCount = response.thirdParty.length;
  const cookieCount = response.cookies.length;

  response.trackers.forEach((url) => {
    const li = document.createElement('li');
    li.textContent = url;
    trackerList.appendChild(li);
  });

  response.thirdParty.forEach((domain) => {
    const li = document.createElement('li');
    li.textContent = domain;
    thirdpartyList.appendChild(li);
  });

  response.cookies.forEach((cookie) => {
    const li = document.createElement('li');
    li.textContent = `${cookie.name} (${cookie.domain})`;
    cookieList.appendChild(li);
  });

  let score = trackerCount + thirdPartyCount + cookieCount;
  if (score === 0) {
    status.textContent = 'Всё чисто — трекеров, сторонних доменов и куков не найдено';
    status.className = 'green';
  } else if (score <= 5) {
    status.textContent = `Обнаружены некоторые сторонние элементы (${score})`;
    status.className = 'yellow';
  } else {
    status.textContent = `Низкий уровень приватности: найдено ${score} подозрительных элементов`;
    status.className = 'red';
  }

  clearBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'clearCookies' }, (result) => {
      alert(`Очищено куков: ${result.cleared}`);
      location.reload();
    });
  });
});