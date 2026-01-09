import { Component, inject, signal, afterNextRender, DestroyRef } from '@angular/core';
import { Reloj } from './reloj/reloj';
import { SupabaseService } from '../supabase';

@Component({
  selector: 'app-root',
  imports: [Reloj],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  BDSupabase = inject(SupabaseService);
  private destroyRef = inject(DestroyRef);

  // Signal para overlay de carga
  mostrarOverlay = signal(false);

  constructor() {
    afterNextRender(() => {
      const scrollHandler = () => {
        // Parallax del fondo
        const scrollTop = window.scrollY;
        document.body.style.backgroundPositionY = `${scrollTop * 0.15}px`;
      };

      window.addEventListener('scroll', scrollHandler, { passive: true });

      this.destroyRef.onDestroy(() => {
        window.removeEventListener('scroll', scrollHandler);
      });
    });
  }


  async eventoAsistir(asiste : boolean): Promise<any> {
   
  }

  async confirmarAsistencia(event: Event, asiste: boolean): Promise<void> {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // Mostrar overlay
    this.mostrarOverlay.set(true);

    try {
      // Procesar la asistencia
      const resultado = await this.procesarAsistencia(event.currentTarget, asiste);

      // Ocultar overlay
      this.mostrarOverlay.set(false);

      if (resultado.success) {
        // Cerrar modal
        window.location.hash = '#close';

        // Mostrar notificación de éxito según si asiste o no
        if (asiste) {
          this.showNotification('Te esperamos en el cumpleaños 🎉', 'success');
        } else {
          this.showNotification('Gracias por confirmarnos', 'success');
        }

        // Limpiar el formulario
        form.reset();
      } else {
        // Si hay error, mantener modal abierto y mostrar error
        this.showNotification('Hubo un problema. Por favor, intenta nuevamente.', 'error');
      }
    } catch (error) {
      // Ocultar overlay
      this.mostrarOverlay.set(false);

      // Mostrar notificación de error
      this.showNotification('Error al confirmar asistencia. Intenta nuevamente.', 'error');

      console.error('Error en confirmación:', error);
    }
  }

  // Esta es la función que ejecutas en el fondo
  async procesarAsistencia(objeto: any, asiste: boolean): Promise<{success: boolean, message?: string}> {
    try {
      const nombre: String = objeto[0].value;
      let cantidad: Number = 0;

      // Si asiste, obtener la cantidad del select (objeto[1])
      // Si no asiste, la cantidad es 0 y no hay select
      if (asiste && objeto[1]) {
        cantidad = objeto[1].value;
      }

      const resultado = await this.BDSupabase.insertarData(nombre, cantidad, asiste);

      // Verificar si hubo error en la respuesta de Supabase
      if (resultado.error) {
        console.error('Error de Supabase:', resultado.error);
        return { success: false, message: resultado.error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error al procesar asistencia:', error);
      return { success: false, message: 'Error desconocido' };
    }
  }

  // Sistema de alertas modal
  showNotification(message: string, type: 'success' | 'error') {
    const modal = document.getElementById('alertModal');
    const icon = document.getElementById('alertIcon');
    const title = document.getElementById('alertTitle');
    const messageEl = document.getElementById('alertMessage');
    const button = document.getElementById('alertButton');

    if (!modal || !icon || !title || !messageEl || !button) return;

    // Configurar contenido según el tipo
    if (type === 'success') {
      modal.className = 'alert-modal success';
      icon.textContent = '✓';
      title.textContent = '¡Confirmación exitosa!';
      messageEl.textContent = message;
    } else {
      modal.className = 'alert-modal error';
      icon.textContent = '⚠';
      title.textContent = 'Error';
      messageEl.textContent = message;
    }

    // Mostrar modal
    setTimeout(() => {
      modal.classList.add('active');
    }, 100);

    // Click en el overlay
    const overlay = modal.querySelector('.alert-overlay');

    // Configurar botón de cerrar
    const closeModal = () => {
      modal.classList.remove('active');
      button.removeEventListener('click', closeModal);
      if (overlay) {
        overlay.removeEventListener('click', closeModal);
      }
    };

    // Click en el botón
    button.addEventListener('click', closeModal);

    // Click en el overlay (para cerrar al hacer clic fuera)
    if (overlay) {
      overlay.addEventListener('click', closeModal);
    }
  }
}
