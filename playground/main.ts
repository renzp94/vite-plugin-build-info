document.querySelector('body').innerHTML = JSON.stringify(
  (window as any).VITE_BUILD_INFO,
)
