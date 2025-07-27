//variables globales 
let nombrePro = document.querySelector("#nombre-pro");
let precioPro = document.querySelector("#precio-pro");
let imagenPro = document.querySelector("#imagen-pro");
let descripcionPro = document.querySelector("#descripcion-pro");
let btnGuardar = document.querySelector(".btn-guardar");
let btnBorrar = document.querySelector(".btn-borrar");
let listadoTabla = document.querySelector(".listado tbody");
let buscarPro = document.querySelector("#buscar-pro");
let btnPdf = document.querySelector(".btn-pdf");


localStorage.removeItem("nombre"); // Elimina el item "nombre" del localStorage
 btnBorrar.addEventListener("click", () => {
    localStorage.clear();
    alert("localStorage borrado exitosamente");
}); 


//evento para recargar la pagina y mostrar los datos guardados
document.addEventListener("DOMContentLoaded", () => {
    getData();
});

function validForm() {
    let producto;
    if(nombrePro.value && precioPro.value && imagenPro.value && descripcionPro.value){ 
        producto = {
            nombre: nombrePro.value,
            precio: precioPro.value,
            imagen: imagenPro.value,
            descripcion: descripcionPro.value
        }
        nombrePro.value = "";
        precioPro.value = "";
        imagenPro.value = "";
        descripcionPro.value = "";
    }else{
        alert("por favor complete todos los campos");
    }
    console.log(producto);

    return producto;
}

//funcion para guaradar los datos en localStorage
function saveLocalStorage(pro) {
    let productosGuardados = JSON.parse(localStorage.getItem("listado-pro"))|| [];
    productosGuardados.push(pro);
    localStorage.setItem("listado-pro", JSON.stringify(productosGuardados));
    alert("Producto guardado exitosamente");
}

// Escuchar el evento input en el campo de búsqueda
buscarPro.addEventListener("input", searchProduct);

// Función para limpiar la tabla antes de mostrar los resultados
function clearTable() {
    listadoTabla.innerHTML = "";
}

// Función para crear una fila de producto
function crearFilaProducto(producto, i) {
    const fila = document.createElement('tr');
    fila.dataset.index = i; // Guardar el índice en el dataset
    fila.innerHTML = `
        <td>${i + 1}</td>
        <td>${producto.nombre}</td>
        <td>${producto.precio}</td>
        <td>${producto.descripcion}</td>
        <td><img src="${producto.imagen}" alt="${producto.nombre}" width="120"></td>
        <td>
            <button class="btn btn-warning" type="button"><img class="icon" src="./img/edit.png" alt="editar"></button>
            <button class="btn btn-danger" type="button"><img class="icon" src="./img/delete.png" alt="delete"></button>
        </td>
    `;
    return fila;
}

// Delegación de eventos para editar y borrar
listadoTabla.addEventListener("click", function(event) {
    const btnEdit = event.target.closest(".btn-warning");
    const btnDelete = event.target.closest(".btn-danger");
    const fila = event.target.closest("tr");
    if (btnEdit && fila) {
        editarProducto(Number(fila.dataset.index));
    }
    if (btnDelete && fila) {
        borrarProducto(Number(fila.dataset.index));
    }
});

let editIndex = null; // Variable global para saber si estamos editando

function guardarHandler() {
    let infoPro = validForm();
    if (infoPro) {
        let productosGuardados = JSON.parse(localStorage.getItem("listado-pro")) || [];
        if (editIndex !== null) {
            // Modo edición: reemplaza el producto en la posición editIndex
            productosGuardados[editIndex] = infoPro;
            localStorage.setItem("listado-pro", JSON.stringify(productosGuardados));
            editIndex = null; // Salimos del modo edición
        } else {
            // Modo nuevo: agrega el producto
            productosGuardados.push(infoPro);
            localStorage.setItem("listado-pro", JSON.stringify(productosGuardados));
        }
        clearTable();
        getData();
    }
}

btnGuardar.onclick = guardarHandler;

// Al hacer clic en editar, activa el modo edición y rellena el formulario
function editarProducto(index) {
    let productosGuardados = JSON.parse(localStorage.getItem("listado-pro")) || [];
    const producto = productosGuardados[index];
    if (!producto) return;

    nombrePro.value = producto.nombre;
    precioPro.value = producto.precio;
    imagenPro.value = producto.imagen;
    descripcionPro.value = producto.descripcion;

    editIndex = index; // Activar modo edición
}

// Función para borrar producto
function borrarProducto(index) {
    let productosGuardados = JSON.parse(localStorage.getItem("listado-pro")) || [];
    productosGuardados.splice(index, 1);
    localStorage.setItem("listado-pro", JSON.stringify(productosGuardados));
    clearTable();
    getData();
}

// Función para obtener los datos del localStorage y mostrarlos en la tabla
// Se llama al cargar la página y después de guardar un producto
function getData() {
    let productosGuardados = JSON.parse(localStorage.getItem("listado-pro"))|| [];
    productosGuardados.forEach((producto, i) => {
        const fila = crearFilaProducto(producto, i);
        listadoTabla.appendChild(fila);
    });
}

// Función para buscar productos por nombre
// Se activa al escribir en el campo de búsqueda
function searchProduct() {
    let searchTerm = buscarPro.value.toLowerCase();
    let productosGuardados = JSON.parse(localStorage.getItem("listado-pro")) || [];
    clearTable();

    productosGuardados.forEach((producto, i) => {
        if (producto.nombre.toLowerCase().includes(searchTerm)) {
            const fila = crearFilaProducto(producto, i);
            listadoTabla.appendChild(fila);
        }
    });
}


// Función para generar un PDF con los productos
function generarPDF() {
    const tabla = document.querySelector('.listado');
    html2canvas(tabla).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jspdf.jsPDF();
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('productos.pdf');
    });
}

btnPdf.addEventListener('click', generarPDF);