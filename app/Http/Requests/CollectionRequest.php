<?php

namespace App\Http\Requests;

use App\Models\Quote;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CollectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        $collection = $this->route('collection');

        return $this->user() && (! $collection || $collection->user_id === $this->user()->id);
    }

    protected function prepareForValidation(): void
    {
        $name = is_string($this->input('name')) ? trim($this->input('name')) : $this->input('name');
        $this->merge([
            'name' => $name,
            'normalized_name' => is_string($name) ? mb_strtolower($name) : $name,
        ]);
    }

    public function rules(): array
    {
        $idRules = ['sometimes', 'uuid'];
        if ($this->isMethod('post')) {
            $idRules[] = Rule::unique('quote_collections', 'id');
        }

        return [
            'id' => $idRules,
            'name' => ['required', 'string', 'min:1', 'max:60'],
            'normalized_name' => [
                'required',
                'string',
                Rule::unique('quote_collections', 'normalized_name')
                    ->where('user_id', $this->user()->id)
                    ->ignore($this->route('collection')?->id),
            ],
            'background_color' => ['sometimes', Rule::in(['green', 'ivory', 'orange', 'red'])],
            'quoteIds' => ['present', 'array', 'max:1000'],
            'quoteIds.*' => ['uuid'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if ($validator->errors()->any()) {
                return;
            }
            $ids = array_values(array_unique($this->input('quoteIds', [])));
            if (
                Quote::active()
                    ->where('user_id', $this->user()->id)
                    ->whereIn('id', $ids)
                    ->count() !== count($ids)
            ) {
                $validator
                    ->errors()
                    ->add('quoteIds', 'Only your own available quotes can be added.');
            }
        });
    }

    public function messages(): array
    {
        return ['normalized_name.unique' => 'Choose a unique collection name of 1–60 characters.'];
    }
}
