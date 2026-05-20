import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './shared/layout/nav';
import { FooterComponent } from './shared/layout/footer';
import { AudioPlayerComponent } from './shared/layout/audio-player';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavComponent, FooterComponent, AudioPlayerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
