/**
 * Form Generation Library - Component Registry
 * 
 * Singleton registry for managing field components
 */

import type { FieldType, FieldComponent } from '../types';

/**
 * Component Registry for dynamic field rendering
 * 
 * Uses Singleton pattern to ensure a single global registry instance.
 * Allows registration, retrieval, and override of field components.
 */
export class ComponentRegistry {
    private static instance: ComponentRegistry;
    private registry: Map<FieldType | string, FieldComponent>;

    private constructor() {
        this.registry = new Map();
    }

    /**
     * Get singleton instance of ComponentRegistry
     */
    public static getInstance(): ComponentRegistry {
        if (!ComponentRegistry.instance) {
            ComponentRegistry.instance = new ComponentRegistry();
        }
        return ComponentRegistry.instance;
    }

    /**
     * Register a component for a specific field type
     * 
     * @param type - Field type identifier
     * @param component - React component to register
     * @throws Error if type is already registered (use override instead)
     */
    public register(type: FieldType | string, component: FieldComponent): void {
        if (this.registry.has(type)) {
            console.warn(
                `Component for type "${type}" is already registered. Use override() to replace it.`
            );
            return;
        }

        this.registry.set(type, component);
    }

    /**
     * Get a registered component by type
     * 
     * @param type - Field type identifier
     * @returns Component if found, undefined otherwise
     */
    public get(type: FieldType | string): FieldComponent | undefined {
        return this.registry.get(type);
    }

    /**
     * Check if a type is registered
     * 
     * @param type - Field type identifier
     * @returns true if registered, false otherwise
     */
    public has(type: FieldType | string): boolean {
        return this.registry.has(type);
    }

    /**
     * Override an existing component registration
     * 
     * @param type - Field type identifier
     * @param component - New component to register
     */
    public override(type: FieldType | string, component: FieldComponent): void {
        if (!this.registry.has(type)) {
            console.warn(
                `Component for type "${type}" is not registered. Use register() instead.`
            );
        }

        this.registry.set(type, component);
    }

    /**
     * Unregister a component
     * 
     * @param type - Field type identifier
     * @returns true if component was found and removed, false otherwise
     */
    public unregister(type: FieldType | string): boolean {
        return this.registry.delete(type);
    }

    /**
     * Get all registered field types
     * 
     * @returns Array of registered field type identifiers
     */
    public getRegisteredTypes(): (FieldType | string)[] {
        return Array.from(this.registry.keys());
    }

    /**
     * Clear all registrations
     * 
     * Useful for testing or resetting state
     */
    public clear(): void {
        this.registry.clear();
    }

    /**
     * Get count of registered components
     */
    public get size(): number {
        return this.registry.size;
    }

    /**
     * Batch register multiple components
     * 
     * @param components - Object mapping types to components
     */
    public registerBatch(components: Record<string, FieldComponent>): void {
        Object.entries(components).forEach(([type, component]) => {
            this.register(type as FieldType, component);
        });
    }
}

/**
 * Get the global component registry instance
 */
export const getRegistry = () => ComponentRegistry.getInstance();

/**
 * Shorthand for registering a component
 */
export const registerComponent = (
    type: FieldType | string,
    component: FieldComponent
) => {
    ComponentRegistry.getInstance().register(type, component);
};

/**
 * Shorthand for getting a component
 */
export const getComponent = (type: FieldType | string) => {
    return ComponentRegistry.getInstance().get(type);
};
