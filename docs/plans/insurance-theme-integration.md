# Implementation Plan: Theme Integration for Insurance Page

## Summary

Integrate the existing theme system with the insurance page and related components to provide consistent theming, improve user experience, and enable dynamic theme switching for the insurance section of the application.

## Scope

**In Scope**
- Integrate existing medical theme with insurance page
- Update insurance components to use theme system
- Add theme context to insurance page layout
- Update insurance navbar config to be theme-aware
- Test theme switching functionality

**Out of Scope**
- Complete migration of header/footer to theme system (they work well as-is)
- Creation of new insurance-specific theme
- Theme customization UI for insurance page

**Assumptions**
- Existing theme system in `src/lib/theme/` is stable and production-ready
- Medical theme colors are appropriate for insurance industry
- User wants to leverage existing theme infrastructure rather than create new system

---

## Tasks

#### Phase 1: Theme Integration Setup [Total: 1h]
| # | Task | Size | Depends On |
|---|------|------|------------|
| 1 | Add ThemeProvider to insurance page layout | M | - |
| 2 | Configure healthcare user group for insurance | S | 1 |
| 3 | Update insurance page to use theme context | M | 2 |

#### Phase 2: Component Theme Updates [Total: 2h]
| # | Task | Size | Depends On |
|---|------|------|------------|
| 4 | Update InsurancePageHero to use theme colors | M | 1 |
| 5 | Update InsurancePageControls theme integration | M | 1 |
| 6 | Update InsurancePageContent theme awareness | M | 1 |
| 7 | Test theme switching in insurance components | S | 4,5,6 |

#### Phase 3: Navbar Configuration [Total: 1h]
| # | Task | Size | Depends On |
|---|------|------|------------|
| 8 | Make insurance navbar config theme-aware | M | 1 |
| 9 | Update navbar icon colors to use theme | S | 8 |
| 10 | Test navbar theme consistency | S | 9 |

#### Phase 4: Testing & Validation [Total: 1h]
| # | Task | Size | Depends On |
|---|------|------|------------|
| 11 | Test theme persistence across navigation | M | 3,10 |
| 12 | Validate responsive design with themes | M | 4,5,6 |
| 13 | Test light/dark mode switching | S | 11 |

---

## Files to Create/Modify

**Modify**
- `src/app/[locale]/insurance/page.tsx` - Add ThemeProvider wrapper
- `src/components/features/insurance/InsurancePageHero.tsx` - Theme integration
- `src/components/features/insurance/InsurancePageControls.tsx` - Theme integration
- `src/components/features/insurance/InsurancePageContent.tsx` - Theme integration
- `src/configs/insurance-navbar-config.ts` - Theme-aware configuration

**Create**
- `src/hooks/features/insurance/useInsuranceTheme.ts` - Theme hook for insurance components

---

## Dependencies

**Internal**
- Existing theme system in `src/lib/theme/`
- Medical theme configuration in `src/lib/theme/themes/medical.ts`
- Theme context and providers

**External**
- `next-themes` package (already installed)

---

## Implementation Details

### Task 1: Add ThemeProvider to Insurance Page
Wrap the insurance page with ThemeProvider configured for healthcare user group

### Task 4-6: Component Theme Integration
Replace hardcoded Tailwind classes with theme-aware styling using the theme context

### Task 8-9: Theme-Aware Navbar
Update navbar configuration to use primary color from active theme

---

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Theme hydration mismatch | Medium | Use proper next-themes patterns from existing system |
| Performance impact | Low | Theme system is already optimized |
| Visual inconsistency | Medium | Test all components with both light/dark themes |

---

## Success Criteria
- [ ] Insurance page uses medical theme colors by default
- [ ] All insurance components respond to theme changes
- [ ] Theme persistence works across insurance page navigation
- [ ] Light/dark mode switching functions correctly
- [ ] Visual consistency maintained across all insurance components