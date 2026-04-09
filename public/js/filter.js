
  const filters = document.getElementById("filters");

  document.querySelector(".right-btn").onclick = () => {
    filters.scrollLeft += 200;
  };

  document.querySelector(".left-btn").onclick = () => {
    filters.scrollLeft -= 200;
  };
