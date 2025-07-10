document.addEventListener("DOMContentLoaded", function () {
  actualizarContadorCarrito();

  const secciones = document.querySelectorAll("[data-json]");
  if (secciones.length > 0) {
    secciones.forEach((seccion) => {
      const ruta = seccion.dataset.json;
      cargarProductosDesdeAPI(ruta, seccion);
    });
  }


  const contenedor = document.getElementById("lista-carrito");
  if (contenedor) {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    if (carrito.length === 0) {
      contenedor.innerHTML = "<p>Tu carrito está vacío.</p>";
    } else {
      let totalCompra = 0;

      carrito.forEach((producto, index) => {
        const totalItem = producto.precio * producto.cantidad;
        totalCompra += totalItem;

        const div = document.createElement("div");
        div.classList.add("item-carrito");
        div.innerHTML = `
          <div class="carrito-portada">
            <img src="${producto.imagen}" alt="Portada ${producto.nombre}">
          </div>
          <div class="carrito-info">
            <h3>${producto.nombre}</h3>
            <p>Cantidad: ${producto.cantidad}</p>
            <p>Precio unitario: $${producto.precio}</p>
            <p>Total: $${totalItem}</p>
          </div>
          <button class="eliminar-item" data-index="${index}">✖</button>
        `;
        contenedor.appendChild(div);
      });

      const totalDiv = document.createElement("div");
      totalDiv.classList.add("total-compra");
      totalDiv.innerHTML = `<h3 style="text-align:right; padding: 10px 20px;">Total de compra: $${totalCompra}</h3>`;
      contenedor.appendChild(totalDiv);

      document.querySelectorAll(".eliminar-item").forEach(btn => {
        btn.addEventListener("click", function () {
          const index = this.dataset.index;
          const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
          const productoEliminado = carrito.splice(index, 1)[0];

          const stockKey = `stock_${productoEliminado.id}`;
          const stockActual = parseInt(localStorage.getItem(stockKey) || "0");
          const nuevoStock = stockActual + productoEliminado.cantidad;
          localStorage.setItem(stockKey, nuevoStock);

          localStorage.setItem("carrito", JSON.stringify(carrito));
          location.reload();
        });
      });
    }

    const vaciarBtn = document.getElementById("vaciar-btn");
    if (vaciarBtn) {
      vaciarBtn.addEventListener("click", () => {
        const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
        
    if (carrito.length === 0) {
      alert("El carrito ya está vacío");
      return;
    }
        carrito.forEach(producto => {
          const stockKey = `stock_${producto.id}`;
          const stockActual = parseInt(localStorage.getItem(stockKey) || "0");
          const nuevoStock = stockActual + producto.cantidad;
          localStorage.setItem(stockKey, nuevoStock);
        });
        localStorage.removeItem("carrito");
        location.reload();
      });
    }

    // Comprar
    const comprarBtn = document.getElementById("comprar-btn");
    if (comprarBtn) {
      comprarBtn.addEventListener("click", () => {
        const carritoActual = JSON.parse(localStorage.getItem("carrito")) || [];
        if (carritoActual.length === 0) {
          alert("Tu carrito está vacío.");
        } else {
          alert("Gracias por tu compra 😄");
          localStorage.removeItem("carrito");
          location.reload();
        }
      });
    }
  }
});

// Agregar al carrito
function agregarAlCarrito(producto) {
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const index = carrito.findIndex((item) => item.id === producto.id);
  if (index >= 0) {
    carrito[index].cantidad += producto.cantidad;
  } else {
    carrito.push(producto);
  }
  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarContadorCarrito();
}

function actualizarContadorCarrito() {
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  let total = carrito.reduce((sum, item) => sum + item.cantidad, 0);
  const contador = document.getElementById("contador-carrito");
  if (contador) contador.textContent = `(${total})`;
}

// Cargar productos desde JSON (API)
function cargarProductosDesdeAPI(jsonPath, contenedor) {
  fetch(jsonPath)
    .then(res => res.json())
    .then(productos => {
      productos.forEach(producto => {
        const stockKey = `stock_${producto.id}`;
        const stockInicial = producto.amount || producto.stock || producto.cantidad || 0;
        if (!localStorage.getItem(stockKey)) {
          localStorage.setItem(stockKey, stockInicial);
        }
        let stockActual = parseInt(localStorage.getItem(stockKey)) || 0;

        const precioNum = Number(producto.price) || 0;

        const div = document.createElement("div");
        div.classList.add("producto");
        div.innerHTML = `
          <a href="${producto.link}" class="enlace-detalle">
            <img src="${producto.imagen}" alt="Portada ${producto.name}" />
            <h3>${producto.name}</h3>
          </a>
          <p>$${precioNum.toLocaleString()}</p>
          <p id="stock_${producto.id}">Stock disponible: ${stockActual}</p>
          <input type="number" min="1" max="${stockActual}" value="1" id="cantidad_${producto.id}" />
          <button class="btn-agregar-carrito" 
            data-id="${producto.id}" 
            data-nombre="${producto.name}" 
            data-precio="${precioNum}" 
            data-imagen="${producto.imagen}">Agregar al carrito</button>
          <button class="btn-info">+ Info</button>
        `;

        // + Info
        div.querySelector(".btn-info").addEventListener("click", () => {
          if (!div.querySelector(".descripcion-extra")) {
            const p = document.createElement("p");
            p.classList.add("descripcion-extra");
            p.textContent = producto.description;
            div.appendChild(p);
          }
        });

        // Agregar al carrito
        div.querySelector(".btn-agregar-carrito").addEventListener("click", () => {
          const cantidad = parseInt(document.getElementById(`cantidad_${producto.id}`).value);
          let stockActual = parseInt(localStorage.getItem(stockKey)) || 0;

          if (isNaN(cantidad) || cantidad < 1) {
            alert("Por favor elegí una cantidad válida (mayor a 0).");
            return;
          }
          if (cantidad > stockActual) {
            alert("No hay suficiente stock disponible.");
            return;
          }

          stockActual -= cantidad;
          localStorage.setItem(stockKey, stockActual);
          document.getElementById(`stock_${producto.id}`).textContent = `Stock disponible: ${stockActual}`;

          agregarAlCarrito({
            id: producto.id,
            nombre: producto.name,
            precio: precioNum,
            cantidad,
            imagen: producto.imagen
          });
        });

        contenedor.appendChild(div);
      });
    })
    .catch(err => console.error("Error al cargar productos:", err));
}

window.addEventListener("keydown", function (event) {
  const step = 50; 

  switch (event.key) {
    case "ArrowUp":
      event.preventDefault(); 
      window.scrollBy(0, -step);
      break;
    case "ArrowDown":
      event.preventDefault();
      window.scrollBy(0, step);
      break;
    case "ArrowLeft":
      event.preventDefault();
      window.scrollBy(-step, 0);
      break;
    case "ArrowRight":
      event.preventDefault();
      window.scrollBy(step, 0);
      break;
  }
});