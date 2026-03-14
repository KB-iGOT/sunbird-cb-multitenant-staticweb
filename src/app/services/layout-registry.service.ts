import { Injectable } from '@angular/core';
import { Type } from '@angular/core';

export interface ILayoutComponent {
  tenant: any;
}

@Injectable({
  providedIn: 'root'
})
export class LayoutRegistryService {
  private layoutComponentRegistry = new Map<string, Type<any>>();

  /**
   * Register a layout component for a specific layout type
   */
  registerLayout(layoutType: string, componentType: Type<any>): void {
    this.layoutComponentRegistry.set(layoutType, componentType);
  }

  /**
   * Get the component for a specific layout type
   */
  getLayoutComponent(layoutType: string): Type<any> | null {
    return this.layoutComponentRegistry.get(layoutType) || null;
  }

  /**
   * Get all registered layout types
   */
  getAvailableLayouts(): string[] {
    return Array.from(this.layoutComponentRegistry.keys());
  }
}
