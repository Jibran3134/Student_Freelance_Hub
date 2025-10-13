import { Component } from '@angular/core';
import { ApplicationConfig } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { PrimeNgImportsModule } from '../primeng-imports';
@Component({
  selector: 'app-dashboard',
   imports: [PrimeNgImportsModule],  // Spread operator to import all
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

}
