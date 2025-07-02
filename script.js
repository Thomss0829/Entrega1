document.addEventListener("DOMContentLoaded", function () {
  actualizarContadorCarrito();
  if (document.getElementById("contenedor-productos")) {
    generarProductos(); // Solo se ejecuta en index.html
  }

  const cantidadInput = document.querySelector("#cantidad");
  const stockLabel = document.getElementById("stock-disponible");
  const botonAgregar = document.querySelector(".btn-agregar-carrito");

  if (botonAgregar && cantidadInput && stockLabel) {
    const id = botonAgregar.dataset.id;
    const stockKey = `stock_${id}`;

    // Si no hay stock en localStorage, se inicializa en 100 por defecto
    if (!localStorage.getItem(stockKey)) {
      localStorage.setItem(stockKey, "100");
    }

    const stockActual = parseInt(localStorage.getItem(stockKey));
    stockLabel.textContent = stockActual;

    botonAgregar.addEventListener("click", () => {
      const nombre = botonAgregar.dataset.nombre;
      const precio = parseFloat(botonAgregar.dataset.precio);
      const imagen = botonAgregar.dataset.imagen;
      const cantidad = parseInt(cantidadInput.value);

      if (isNaN(cantidad) || cantidad < 1) {
        alert("Por favor elegí una cantidad válida (mayor a 0).");
        cantidadInput.value = 1;
        return;
      }

      const stockActual = parseInt(localStorage.getItem(stockKey));
      if (cantidad > stockActual) {
        alert("No hay suficiente stock disponible.");
        return;
      }

      const nuevoStock = stockActual - cantidad;
      localStorage.setItem(stockKey, nuevoStock);
      stockLabel.textContent = nuevoStock;

      const producto = { id, nombre, precio, cantidad, imagen };
      agregarAlCarrito(producto);
    });
  }

  // Mostrar productos del carrito
  const contenedor = document.getElementById("lista-carrito");
  if (contenedor) {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    if (carrito.length === 0) {
      contenedor.innerHTML = "<p>Tu carrito está vacío.</p>";
    } else {
      carrito.forEach((producto, index) => {
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
            <p>Total: $${producto.precio * producto.cantidad}</p>
          </div>
          <button class="eliminar-item" data-index="${index}">✖</button>
        `;
        contenedor.appendChild(div);
      });

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

    // Botón vaciar
    const vaciarBtn = document.getElementById("vaciar-btn");
    if (vaciarBtn) {
      vaciarBtn.addEventListener("click", () => {
        const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
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

    // Botón comprar
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

// === FUNCIONES ===

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

function generarProductos() {
  const productos = [
    {
      id: "1",
      name: "NIER: AUTOMATA VOL. 1",
      description: "¡Una nueva serie dentro del universo del popular juego NieR: Automata!",
      amount: 100,
      price: 10000,
      imagen: "Nier_.jpg",
      link: "detalle_nier.html"
    },
    {
      id: "2",
      name: "Green Lantern: Caballeros Esmeraldas",
      description: "¡EL ENCUENTRO IMPOSIBLE DE DOS GREEN LANTERN!",
      amount: 100,
      price: 23000,
      imagen: "GLCOV.jpg",
      link: "detalle_GL.html"
    },
    {
      id: "3",
      name: "LIGA DE LA JUSTICIA INTERNACIONAL: EL VECTOR EXTREMISTA",
      description: "¡Peligros extremos!",
      amount: 100,
      price: 28000,
      imagen: "JLI6.jpg",
      link: "detalle_JLI6.html"
    },
    {
      id: "4",
      name: "STAR WARS: DARTH VADER LORD OSCURO VOL. 01",
      description: "Empieza justo después de Episodio III: La venganza de los Sith.",
      amount: 100,
      price: 37900,
      imagen: "DarthVaderCov.jpg",
      link: "detalle_darthvader.html"
    }
  ];

  const contenedor = document.getElementById("contenedor-productos");
  productos.forEach((producto) => {
    const div = document.createElement("div");
    div.classList.add("producto");
    div.innerHTML = `
      <a href="${producto.link}">
        <img src="${producto.imagen}" alt="Portada ${producto.name}" />
      </a>
      <h3>${producto.name}</h3>
      <p>$${producto.price.toLocaleString()}</p>
    `;

    const botonInfo = document.createElement("button");
    botonInfo.textContent = "+ Info";
    botonInfo.classList.add("btn-info");
    botonInfo.addEventListener("click", () => {
      if (!div.querySelector(".descripcion-extra")) {
        const p = document.createElement("p");
        p.classList.add("descripcion-extra");
        p.textContent = producto.description;
        div.appendChild(p);
      }
    });

    div.appendChild(botonInfo);
    contenedor.appendChild(div);
  });
}
