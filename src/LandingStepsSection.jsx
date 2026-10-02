import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Cloud,
  CloudUpload,
  Github,
  Link2,
  Play,
  Share2,
  Upload,
  UserRoundPlus,
} from 'lucide-react';
import './LandingStepsSection.css';

const steps = [
  {
    icon: UserRoundPlus,
    title: 'Create your account',
    category: 'Identity & Workspace',
    description: 'Sign up with email, Google, or GitHub.',
    stage: 'STAGE 1 OF 3: IDENTITY & SETUP',
    url: 'pipeline://workspace.cloud/stage/identity',
  },
  {
    icon: Upload,
    title: 'Add your files',
    category: 'Ingestion & Assets',
    description: 'Upload from your device or choose files from Google Drive.',
    stage: 'STAGE 2 OF 3: ASSET INGESTION & PIPELINE',
    url: 'pipeline://workspace.cloud/stage/asset-ingestion',
  },
  {
    icon: Share2,
    title: 'Organize and share',
    category: 'Access & Delivery',
    description: 'Find what you need and choose viewer or editor access when sharing.',
    stage: 'STAGE 3 OF 3: PERMISSIONS & SECURE DELIVERY',
    url: 'pipeline://workspace.cloud/stage/permissions-delivery',
  },
];

// eslint-disable-next-line react/prop-types
const CheckMark = ({ className = 'h-4 w-4' }) => (
  <Check className={className} aria-hidden="true" strokeWidth={2.5} />
);

function AccountPreview() {
  return (
    <div className="mx-auto max-w-md py-2 text-center">
      <div className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-100 bg-brand-50 text-brand-600 shadow-sm">
        <UserRoundPlus className="h-7 w-7" aria-hidden="true" />
        <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-white">
          <CheckMark className="h-3 w-3" />
        </span>
      </div>
      <h3 className="text-2xl font-bold tracking-tight text-slate-900">
        Create your personal workspace
      </h3>
      <p className="mb-5 mt-1 text-sm text-slate-500">Choose how you&apos;d like to get started today.</p>

      <div className="space-y-2.5">
        <div className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm">
          <span className="font-bold text-blue-600" aria-hidden="true">G</span>
          Continue with Google
        </div>
        <div className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm">
          <Github className="h-4 w-4 fill-slate-900" aria-hidden="true" />
          Continue with GitHub
        </div>
      </div>

      <div className="relative my-4 flex items-center justify-center text-xs uppercase">
        <span className="absolute inset-x-0 border-t border-slate-200" />
        <span className="relative bg-white px-2 font-mono text-slate-400">or email</span>
      </div>
      <div className="pipeline-email-row flex gap-2">
        <div className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-left text-sm text-slate-500">
          name@example.com
        </div>
        <span className="whitespace-nowrap rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm">
          Get Started
        </span>
      </div>
      <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-slate-400">
        <span className="inline-flex items-center gap-1">
          <CheckMark className="h-3.5 w-3.5 text-emerald-500" />
          Email verification
        </span>
        <span className="inline-flex items-center gap-1">
          <CheckMark className="h-3.5 w-3.5 text-emerald-500" />
          Google and GitHub
        </span>
      </div>
    </div>
  );
}

function UploadPreview() {
  return (
    <div className="mx-auto max-w-xl py-2">
      <div className="group relative rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50/40 p-7 text-center transition hover:bg-brand-50/70">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-brand-100 bg-white text-brand-600 shadow-sm">
          <CloudUpload className="h-6 w-6" aria-hidden="true" />
        </div>
        <p className="text-base font-semibold text-slate-800">
          Drop your design files, documents, or archives
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Upload from your device or choose files from Google Drive
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-2xs">
            <Upload className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
            Browse Device
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-2xs">
            <Cloud className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
            Connect Google Drive
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        <div className="flex items-center justify-between rounded-xl border border-slate-200/90 bg-slate-50 p-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-xs font-bold text-indigo-600">
              ZIP
            </span>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex justify-between gap-2 text-xs font-medium text-slate-700">
                <span className="truncate">Branding_Assets.zip</span>
                <span className="shrink-0 font-mono font-semibold text-brand-600">82%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                <div className="pipeline-upload-progress h-full w-[82%] rounded-full bg-brand-500" />
              </div>
            </div>
          </div>
          <span className="ml-2 shrink-0 text-xs font-medium text-slate-400">24.2 MB</span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-2.5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <CheckMark />
            </span>
            <div className="min-w-0">
              <div className="truncate text-xs font-semibold text-slate-800">Product_Roadmap.pdf</div>
              <div className="text-[11px] font-medium text-emerald-700">Ready to share</div>
            </div>
          </div>
          <span className="shrink-0 text-[11px] font-mono text-slate-400">11.8 MB</span>
        </div>
      </div>
    </div>
  );
}

function SharingPreview() {
  return (
    <div className="mx-auto max-w-lg py-2">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">Project Collaborators</h3>
          <p className="text-xs text-slate-500">Manage who can see or edit this workspace</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs">
          <span aria-hidden="true">+</span>
          Invite Teammates
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {[
          { initials: 'AM', name: 'Alex Morgan', email: 'alex@example.com', role: 'Editor Access', tint: 'bg-slate-200 text-slate-700' },
          { initials: 'ER', name: 'Elena Rostova', email: 'elena@example.com', role: 'Viewer Access', tint: 'bg-brand-100 text-brand-700' },
        ].map((person) => (
          <div className="pipeline-person-row flex items-center justify-between gap-3 py-3" key={person.email}>
            <div className="flex min-w-0 items-center gap-3">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-2 ring-white ${person.tint}`}>
                {person.initials}
              </span>
              <div className="min-w-0">
                <div className="truncate text-xs font-semibold text-slate-900">{person.name}</div>
                <div className="truncate text-[11px] text-slate-500">{person.email}</div>
              </div>
            </div>
            <span className="shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700">
              {person.role}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50 p-3.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <Link2 className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0 text-left">
            <div className="text-xs font-semibold text-slate-800">Share with a secure link</div>
            <div className="text-[11px] text-slate-500">Choose viewer or editor access</div>
          </div>
        </div>
        <span className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-600 shadow-2xs">
          Copy Link
        </span>
      </div>
    </div>
  );
}

// eslint-disable-next-line react/prop-types
function StepPreview({ step }) {
  if (step === 1) return <AccountPreview />;
  if (step === 2) return <UploadPreview />;
  return <SharingPreview />;
}

// eslint-disable-next-line react/prop-types
export default function LandingStepsSection({ onGetStarted, addRevealRef }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const stepRefs = useRef([]);

  useEffect(() => {
    if (!isAutoPlaying) return undefined;

    const timer = window.setInterval(() => {
      setCurrentStep((step) => (step === steps.length ? 1 : step + 1));
    }, 3500);

    return () => window.clearInterval(timer);
  }, [isAutoPlaying]);

  const selectStep = (step) => {
    setIsAutoPlaying(false);
    setCurrentStep(step);
  };

  const moveStep = (direction) => {
    setIsAutoPlaying(false);
    setCurrentStep((step) => {
      if (direction > 0 && step === steps.length) return 1;
      return Math.min(steps.length, Math.max(1, step + direction));
    });
  };

  const handleTabKeyDown = (event, index) => {
    let nextIndex = index;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = (index + 1) % steps.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = (index - 1 + steps.length) % steps.length;
    } else {
      return;
    }

    event.preventDefault();
    selectStep(nextIndex + 1);
    stepRefs.current[nextIndex]?.focus();
  };

  return (
    <section
      className="landing-pipeline-section landing-section relative isolate flex w-full flex-col items-center justify-center overflow-hidden px-4 py-12 sm:px-6 sm:py-20 lg:px-8"
      id="how-it-works"
      aria-labelledby="landing-steps-title"
    >
      <div className="pipeline-background-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto w-full max-w-6xl">
        <header className="mx-auto mb-10 max-w-3xl text-center sm:mb-14">
          <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-brand-200/90 bg-white/90 p-1.5 pr-4 shadow-sm backdrop-blur-md">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200/80 bg-brand-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-700">
              <span className="h-2 w-2 animate-subtle-pulse rounded-full bg-brand-500" aria-hidden="true" />
              Flow Architecture
            </span>
            <span className="text-slate-300" aria-hidden="true">|</span>
            <button
              className="group inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-700 transition hover:text-brand-600"
              aria-pressed={isAutoPlaying}
              onClick={() => setIsAutoPlaying((playing) => !playing)}
              title="Automatically simulate the step pipeline"
              type="button"
            >
              <span className="relative flex h-2.5 w-2.5">
                {isAutoPlaying && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
                )}
                <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${isAutoPlaying ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              </span>
              {isAutoPlaying ? 'Simulating...' : 'Simulate Flow'}
              <Play className="h-3.5 w-3.5 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600" fill="currentColor" aria-hidden="true" />
            </button>
          </div>
          <h2
            className="text-3xl font-extrabold leading-[1.12] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl"
            id="landing-steps-title"
          >
            Get started in a few steps.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Experience seamless progression through our interconnected setup pipeline. Watch data transition in real time from identity verification to automated permission management.
          </p>
        </header>

        <div
          className="pipeline-track relative z-10 mb-10 flex flex-col items-stretch gap-4 lg:mb-14 lg:flex-row lg:gap-0"
          role="tablist"
          aria-label="CloudVault setup steps"
        >
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCurrent = stepNumber === currentStep;
            const isPassed = stepNumber < currentStep;
            const Icon = step.icon;
            const progress = isPassed || isCurrent ? '100%' : '0%';

            return (
              <div className="pipeline-track-item flex flex-col lg:contents" key={step.title}>
                <button
                  aria-controls="landing-pipeline-preview"
                  aria-selected={isCurrent}
                  className={`pipeline-card group relative z-10 flex min-h-[230px] flex-1 cursor-pointer flex-col justify-between overflow-hidden rounded-2xl p-6 text-left transition-all focus:outline-none ${
                    isCurrent
                      ? 'pipeline-card-active border-2 border-brand-500 bg-white shadow-node-active ring-4 ring-brand-500/10'
                      : isPassed
                        ? 'pipeline-card-passed border border-emerald-300 bg-white/95 shadow-subtle'
                        : 'pipeline-card-idle border border-slate-200 bg-white/85 hover:border-brand-300 hover:shadow-subtle'
                  }`}
                  id={`pipeline-step-${stepNumber}`}
                  onClick={() => selectStep(stepNumber)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                  ref={(element) => { stepRefs.current[index] = element; }}
                  role="tab"
                  tabIndex={isCurrent ? 0 : -1}
                  type="button"
                >
                  <span className={`pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full blur-2xl transition-opacity ${isCurrent ? 'bg-brand-100 opacity-80' : isPassed ? 'bg-emerald-50 opacity-40' : 'bg-brand-50 opacity-0 group-hover:opacity-80'}`} />
                  <span>
                    <span className="mb-4 flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2">
                        <span className={`relative flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ${isCurrent ? 'bg-brand-500 shadow-sm' : isPassed ? 'bg-emerald-500' : 'border border-slate-200 bg-slate-100 text-slate-500'}`}>
                          {isPassed ? <CheckMark className="h-3.5 w-3.5" /> : stepNumber}
                          {isCurrent && <span className="pipeline-pulse-ring absolute inset-0 rounded-full bg-brand-400" />}
                        </span>
                        <span className={`font-mono text-xs font-bold uppercase tracking-wider ${isCurrent ? 'text-brand-700' : 'text-slate-400 transition-colors group-hover:text-brand-600'}`}>
                          Stage {String(stepNumber).padStart(2, '0')}
                        </span>
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${isCurrent ? 'bg-brand-100 text-brand-700' : isPassed ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {isCurrent ? 'Active' : isPassed ? 'Completed' : stepNumber === 2 ? 'Next In Pipeline' : 'Final Delivery'}
                      </span>
                    </span>

                    <span className="mb-3 flex items-center gap-3.5">
                      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all duration-200 ${isCurrent ? 'border-brand-200 bg-brand-100 text-brand-600' : 'border-slate-200 bg-slate-100 text-slate-600 group-hover:border-brand-200 group-hover:bg-brand-50 group-hover:text-brand-600'}`}>
                        <Icon className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
                      </span>
                      <span>
                        <span className="block text-lg font-bold text-slate-900 transition-colors group-hover:text-brand-600">{step.title}</span>
                        <span className={`block text-[11px] font-medium ${isCurrent ? 'text-brand-600' : 'text-slate-400 group-hover:text-brand-500'}`}>{step.category}</span>
                      </span>
                    </span>
                    <span className="mb-4 block text-xs leading-relaxed text-slate-600">{step.description}</span>
                  </span>

                  <span className="border-t border-slate-100 pt-3">
                    <span className="mb-1.5 flex items-center justify-between text-[11px]">
                      <span className="font-medium text-slate-500">Flow Readiness</span>
                      <span className={`font-mono font-bold ${isCurrent ? 'text-brand-600' : isPassed ? 'text-emerald-600' : 'text-slate-400'}`}>{progress}</span>
                    </span>
                    <span className="block h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <span className={`block h-full rounded-full transition-all duration-500 ${isPassed ? 'bg-emerald-500' : 'bg-brand-500'}`} style={{ width: progress }} />
                    </span>
                  </span>
                </button>

                {index < steps.length - 1 && (
                  <span className="pipeline-connector relative z-20 flex shrink-0 items-center justify-center px-2 py-1 lg:flex-col lg:px-3 lg:py-0" aria-hidden="true">
                    <span className={`pipeline-connector-capsule relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border shadow-md ${stepNumber < currentStep ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : isCurrent ? 'border-brand-300 bg-white text-brand-600' : 'border-slate-200 bg-white text-slate-400 shadow-sm'}`}>
                      <span className={`absolute inset-y-0 left-0 w-full bg-gradient-to-r from-transparent via-brand-400/40 to-transparent ${isCurrent ? 'connector-photon' : 'hidden'}`} />
                      <ArrowRight className="relative z-10 h-4 w-4" strokeWidth={2.5} />
                    </span>
                    <span className="mt-1.5 hidden h-1 w-12 overflow-hidden rounded-full bg-slate-200 lg:block">
                      <span className={`block h-full transition-all duration-500 ${stepNumber < currentStep ? 'bg-emerald-500' : 'bg-brand-500'}`} style={{ width: stepNumber < currentStep || isCurrent ? '100%' : '0%' }} />
                    </span>
                    <span className="mt-1 flex h-7 w-7 items-center justify-center rounded-full border border-brand-200 bg-white text-brand-600 shadow-xs lg:hidden">
                      <ChevronRight className="h-4 w-4 rotate-90" aria-hidden="true" />
                    </span>
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <section
          aria-label={`Step ${currentStep}: ${steps[currentStep - 1].title}`}
          aria-labelledby="pipeline-preview-heading"
          className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white/95 p-5 shadow-elevation backdrop-blur-md sm:p-9"
          id="landing-pipeline-preview"
          role="tabpanel"
          tabIndex={0}
          ref={addRevealRef}
        >
          <div className="mb-6 flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex min-w-0 items-center gap-2">
              <span className="h-3 w-3 shrink-0 rounded-full bg-rose-400 shadow-2xs" />
              <span className="h-3 w-3 shrink-0 rounded-full bg-amber-400 shadow-2xs" />
              <span className="h-3 w-3 shrink-0 rounded-full bg-emerald-400 shadow-2xs" />
              <span className="ml-2 hidden truncate font-mono text-xs text-slate-400 sm:inline">
                {steps[currentStep - 1].url}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-mono text-xs font-semibold text-slate-600">
                <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-500" />
                <span className="sr-only" id="pipeline-preview-heading">{steps[currentStep - 1].stage}</span>
                <span aria-hidden="true">{steps[currentStep - 1].stage}</span>
              </span>
            </div>
          </div>

          <div
            aria-label="Illustrative preview of this CloudVault step"
            className="pipeline-preview"
            key={currentStep}
            role="img"
          >
            <StepPreview step={currentStep} />
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-4 sm:flex-row">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="h-2 w-2 rounded-full bg-brand-500" aria-hidden="true" />
              <span>Pipeline Synced. Click nodes or controls to advance</span>
            </div>
            <div className="flex w-full items-center gap-3 sm:w-auto">
              <button
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                disabled={currentStep === 1}
                onClick={() => moveStep(-1)}
                type="button"
              >
                Previous Stage
              </button>
              <button
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-5 py-2 text-xs font-semibold text-white shadow-sm transition active:scale-95 sm:flex-none ${currentStep === steps.length ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-brand-600 hover:bg-brand-700'}`}
                onClick={() => currentStep === steps.length ? onGetStarted() : moveStep(1)}
                type="button"
              >
                <span>{currentStep === steps.length ? 'Complete Pipeline' : 'Next Stage'}</span>
                {currentStep === steps.length
                  ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  : <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />}
              </button>
            </div>
          </div>
        </section>

        <footer className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-center text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-4 w-4 text-emerald-500" aria-hidden="true" />
            Free plan available
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-4 w-4 text-emerald-500" aria-hidden="true" />
            Import only the files you choose
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-4 w-4 text-emerald-500" aria-hidden="true" />
            Viewer or editor sharing permissions
          </span>
        </footer>
      </div>
    </section>
  );
}
