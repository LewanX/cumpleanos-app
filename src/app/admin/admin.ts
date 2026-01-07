import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SupabaseService } from '../../supabase';

interface Persona {
  id?: number;
  nombre_USUA: string;
  cantidad_personas_USUA: number;
  asiste_USUA: boolean;
  created_at?: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class AdminComponent implements OnInit {
  BDSupabase = inject(SupabaseService);
  router = inject(Router);

  // Exponer Math para el template
  Math = Math;

  personas: Persona[] = [];
  personasFiltradas: Persona[] = [];
  personasPaginadas: Persona[] = [];
  cargando = true;
  error = '';

  // Filtros y ordenamiento
  busqueda = '';
  ordenarPor: 'nombre' | 'cantidad' | 'fecha' = 'nombre';
  ordenAscendente = true;
  filtroAsistencia: 'asisten' | 'no_asisten' | 'todos' = 'asisten';

  // Paginación
  paginaActual = 1;
  itemsPorPagina = 10;
  totalPaginas = 0;

  async ngOnInit() {
    // Manejar callback de OAuth (cuando vuelve de Google)
    await this.manejarCallbackOAuth();

    await this.verificarAutenticacion();
    await this.cargarDatos();
  }

  async manejarCallbackOAuth() {
    // Si hay un hash en la URL (access_token del callback de OAuth)
    if (window.location.hash) {
      // Supabase automáticamente maneja el hash y establece la sesión
      await this.BDSupabase.supabase.auth.getSession();
      // Limpiar el hash de la URL para que se vea limpia
      window.history.replaceState(null, '', window.location.pathname);
    }
  }

  async verificarAutenticacion() {
    const { data: { user } } = await this.BDSupabase.supabase.auth.getUser();

    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    // Verificar si el usuario está autorizado
    const esAutorizado = await this.BDSupabase.verificarUsuarioAutorizado(user.email || '');

    if (!esAutorizado) {
      alert('No tienes permisos para acceder a esta página');
      await this.cerrarSesion();
    }
  }

  async cargarDatos() {
    try {
      this.cargando = true;
      const resultado = await this.BDSupabase.usuarios();

      if (resultado.error) {
        this.error = 'Error al cargar los datos';
        console.error('Error:', resultado.error);
        return;
      }

      this.personas = resultado.data || [];
      this.aplicarFiltros();
    } catch (error) {
      this.error = 'Error al cargar los datos';
      console.error('Error:', error);
    } finally {
      this.cargando = false;
    }
  }

  aplicarFiltros() {
    let resultado = [...this.personas];

    // Aplicar filtro de asistencia
    if (this.filtroAsistencia === 'asisten') {
      resultado = resultado.filter(p => p.asiste_USUA === true);
    } else if (this.filtroAsistencia === 'no_asisten') {
      resultado = resultado.filter(p => p.asiste_USUA === false);
    }
    // Si es 'todos', no filtrar

    // Aplicar búsqueda
    if (this.busqueda) {
      resultado = resultado.filter(p =>
        p.nombre_USUA.toLowerCase().includes(this.busqueda.toLowerCase())
      );
    }

    // Aplicar ordenamiento
    resultado.sort((a, b) => {
      let comparacion = 0;

      switch(this.ordenarPor) {
        case 'nombre':
          comparacion = a.nombre_USUA.localeCompare(b.nombre_USUA);
          break;
        case 'cantidad':
          comparacion = a.cantidad_personas_USUA - b.cantidad_personas_USUA;
          break;
        case 'fecha':
          const fechaA = new Date(a.created_at || 0).getTime();
          const fechaB = new Date(b.created_at || 0).getTime();
          comparacion = fechaA - fechaB;
          break;
      }

      return this.ordenAscendente ? comparacion : -comparacion;
    });

    this.personasFiltradas = resultado;

    // Calcular paginación
    this.totalPaginas = Math.ceil(this.personasFiltradas.length / this.itemsPorPagina);

    // Si la página actual es mayor que el total de páginas, volver a la página 1
    if (this.paginaActual > this.totalPaginas && this.totalPaginas > 0) {
      this.paginaActual = 1;
    }

    this.aplicarPaginacion();
  }

  aplicarPaginacion() {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    this.personasPaginadas = this.personasFiltradas.slice(inicio, fin);
  }

  onBusquedaChange(event: Event) {
    this.busqueda = (event.target as HTMLInputElement).value;
    this.aplicarFiltros();
  }

  cambiarOrden(campo: 'nombre' | 'cantidad' | 'fecha') {
    if (this.ordenarPor === campo) {
      this.ordenAscendente = !this.ordenAscendente;
    } else {
      this.ordenarPor = campo;
      this.ordenAscendente = true;
    }
    this.aplicarFiltros();
  }

  getTotalPersonas(): number {
    return this.personas
      .filter(p => p.asiste_USUA)
      .reduce((sum, p) => sum + p.cantidad_personas_USUA, 0);
  }

  getTotalConfirmaciones(): number {
    return this.personas.filter(p => p.asiste_USUA).length;
  }

  getTotalNoAsisten(): number {
    return this.personas.filter(p => !p.asiste_USUA).length;
  }

  async cerrarSesion() {
    await this.BDSupabase.signOut();
    this.router.navigate(['/login']);
  }

  getIconoOrden(campo: 'nombre' | 'cantidad' | 'fecha'): string {
    if (this.ordenarPor !== campo) return '↕';
    return this.ordenAscendente ? '↑' : '↓';
  }

  // Métodos de paginación
  irAPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.aplicarPaginacion();
    }
  }

  paginaAnterior() {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.aplicarPaginacion();
    }
  }

  paginaSiguiente() {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
      this.aplicarPaginacion();
    }
  }

  getPaginasVisibles(): number[] {
    const paginas: number[] = [];
    const maxPaginas = 5; // Mostrar máximo 5 botones de página
    let inicio = Math.max(1, this.paginaActual - Math.floor(maxPaginas / 2));
    let fin = Math.min(this.totalPaginas, inicio + maxPaginas - 1);

    // Ajustar inicio si estamos cerca del final
    if (fin - inicio < maxPaginas - 1) {
      inicio = Math.max(1, fin - maxPaginas + 1);
    }

    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }

    return paginas;
  }

  cambiarItemsPorPagina(event: Event) {
    this.itemsPorPagina = parseInt((event.target as HTMLSelectElement).value);
    this.paginaActual = 1;
    this.aplicarFiltros();
  }

  cambiarFiltroAsistencia(filtro: 'asisten' | 'no_asisten' | 'todos') {
    this.filtroAsistencia = filtro;
    this.paginaActual = 1;
    this.aplicarFiltros();
  }
}
