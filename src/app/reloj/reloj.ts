import { Component, OnInit, OnDestroy, signal } from '@angular/core';

@Component({
  selector: 'app-reloj',
  imports: [],
  templateUrl: './reloj.html',
  styleUrl: './reloj.css',
})
export class Reloj implements OnInit, OnDestroy {
  protected readonly dias = signal(0);
  protected readonly horas = signal(0);
  protected readonly minutos = signal(0);
  protected readonly segundos = signal(0);

  private intervalo: any;
  private fechaObjetivo = new Date('2026-01-25T00:00:00');

  ngOnInit() {
    this.actualizarContador();
    this.intervalo = setInterval(() => this.actualizarContador(), 1000);
  }

  ngOnDestroy() {
    if (this.intervalo) {
      clearInterval(this.intervalo);
    }
  }

  private actualizarContador() {
    const ahora = new Date();
    const diferencia = this.fechaObjetivo.getTime() - ahora.getTime();

    if (diferencia > 0) {
      const diasRestantes = Math.floor(diferencia / (1000 * 60 * 60 * 24));
      const horasRestantes = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutosRestantes = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
      const segundosRestantes = Math.floor((diferencia % (1000 * 60)) / 1000);

      this.dias.set(diasRestantes);
      this.horas.set(horasRestantes);
      this.minutos.set(minutosRestantes);
      this.segundos.set(segundosRestantes);
    } else {
      this.dias.set(0);
      this.horas.set(0);
      this.minutos.set(0);
      this.segundos.set(0);
    }
  }
}
