import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SupabaseService } from '../../supabase';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent implements OnInit {
  BDSupabase = inject(SupabaseService);
  router = inject(Router);

  cargando = false;
  error = '';

  async ngOnInit() {
    // Verificar si ya hay una sesión activa
    const { data: { user } } = await this.BDSupabase.supabase.auth.getUser();

    if (user) {
      const esAutorizado = await this.BDSupabase.verificarUsuarioAutorizado(user.email || '');

      if (esAutorizado) {
        this.router.navigate(['/admin']);
      }
    }
  }

  async loginConGoogle() {
    try {
      this.cargando = true;
      this.error = '';

      // Obtener la URL actual (funciona tanto en localhost como en producción)
      const redirectUrl = `${window.location.origin}/admin`;

      console.log('Redirect URL:', redirectUrl); // Para debugging

      const { error } = await this.BDSupabase.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: false
        }
      });

      if (error) {
        this.error = 'Error al iniciar sesión con Google';
        console.error('Error de autenticación:', error);
      }
    } catch (err) {
      this.error = 'Error inesperado al iniciar sesión';
      console.error('Error:', err);
    } finally {
      this.cargando = false;
    }
  }
}
