<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class QuoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        $quote = $this->route('quote');

        return $this->user() && (! $quote || $quote->user_id === $this->user()->id);
    }

    protected function prepareForValidation(): void
    {
        $content = $this->input('content');
        $this->merge([
            'content' => is_string($content) ? trim($content) : $content,
            'drawing_data' => $this->input('drawing_data', []),
        ]);
    }

    public function rules(): array
    {
        $idRules = ['sometimes', 'uuid'];
        if ($this->isMethod('post')) {
            $idRules[] = Rule::unique('quotes', 'id');
        }

        return [
            'id' => $idRules,
            'content' => ['sometimes', 'nullable', 'string', 'max:155'],
            'drawing_data' => ['present', 'array', 'max:400'],
            'drawing_data.*.tool' => ['required', Rule::in(['pen', 'pencil', 'eraser'])],
            'drawing_data.*.color' => ['required', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'drawing_data.*.size' => ['required', 'numeric', 'min:1', 'max:2000'],
            'drawing_data.*.points' => ['required', 'array', 'min:1', 'max:10000'],
            'drawing_data.*.points.*.x' => ['required', 'numeric', 'between:0,800'],
            'drawing_data.*.points.*.y' => ['required', 'numeric', 'between:0,500'],
            'cardImage' => [
                'nullable',
                'string',
                'max:600000',
                'regex:~^data:image/(?:png|jpeg);base64,[A-Za-z0-9+/=]+$~',
            ],
            'design' => ['nullable', 'array:template,color,font,size,position,alignment'],
            'design.template' => [
                'required_with:design',
                Rule::in([
                    'botanical',
                    'arch',
                    'ribbon',
                    'check',
                    'garden',
                    'frame',
                    'plain-ivory',
                    'plain-green',
                    'plain-red',
                    'plain-orange',
                    'plain-black',
                ]),
            ],
            'design.color' => ['required_with:design', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'design.font' => [
                'required_with:design',
                Rule::in(['Georgia', 'Arial', 'Courier New']),
            ],
            'design.size' => ['required_with:design', 'numeric', 'between:32,80'],
            'design.position' => ['required_with:design', Rule::in(['top', 'middle', 'bottom'])],
            'design.alignment' => ['required_with:design', Rule::in(['left', 'center', 'right'])],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if ($validator->errors()->any()) {
                return;
            }
            $content = $this->input('content') ?? '';
            $drawing_data = $this->input('drawing_data', []);
            if (
                ($content === '' && ! count($drawing_data)) ||
                ($content !== '' && mb_strlen($content) < 3)
            ) {
                $validator
                    ->errors()
                    ->add('content', 'Add text of 3–155 characters, a drawing, or both.');
            }
            if (
                array_sum(array_map(fn ($stroke) => count($stroke['points']), $drawing_data)) > 50000
            ) {
                $validator->errors()->add('drawing_data', 'The drawing is too large.');
            }
        });
    }
}
